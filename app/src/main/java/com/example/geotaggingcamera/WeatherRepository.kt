package com.example.geotaggingcamera

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * Fetches current weather from OpenWeatherMap free API.
 *
 * Free tier: 60 calls/min, no credit card required.
 * Get API key at: https://openweathermap.org/api
 *
 * Result is cached for [CACHE_DURATION_MS] to avoid repeated calls.
 */
class WeatherRepository {

    companion object {
        private const val TAG = "WeatherRepository"
        private const val CACHE_DURATION_MS = 10 * 60 * 1000L  // 10 minutes
        private const val TIMEOUT_MS = 6_000
    }

    data class WeatherInfo(
        val tempCelsius: Int,
        val condition: String,
        val emoji: String
    ) {
        val displayText: String get() = "${emoji} ${tempCelsius}°C  $condition"
    }

    private var cachedLat: Double = Double.NaN
    private var cachedLon: Double = Double.NaN
    private var cachedResult: WeatherInfo? = null
    private var cacheTime: Long = 0L

    suspend fun getWeather(lat: Double, lon: Double, apiKey: String): WeatherInfo? =
        withContext(Dispatchers.IO) {
            if (apiKey.isBlank()) return@withContext null

            // Return cached if same location and fresh enough
            val now = System.currentTimeMillis()
            if (cachedResult != null &&
                now - cacheTime < CACHE_DURATION_MS &&
                Math.abs(lat - cachedLat) < 0.05 &&
                Math.abs(lon - cachedLon) < 0.05) {
                return@withContext cachedResult
            }

            var conn: HttpURLConnection? = null
            try {
                val urlStr = "https://api.openweathermap.org/data/2.5/weather" +
                        "?lat=$lat&lon=$lon&appid=$apiKey&units=metric"
                conn = URL(urlStr).openConnection() as HttpURLConnection
                conn.connectTimeout = TIMEOUT_MS
                conn.readTimeout    = TIMEOUT_MS
                conn.connect()

                if (conn.responseCode != 200) {
                    Log.w(TAG, "Weather HTTP ${conn.responseCode}")
                    return@withContext null
                }

                val body = conn.inputStream.bufferedReader().readText()
                val json = JSONObject(body)
                val tempC  = json.getJSONObject("main").getDouble("temp").toInt()
                val condId = json.getJSONArray("weather").getJSONObject(0).getInt("id")
                val condDesc = json.getJSONArray("weather").getJSONObject(0)
                    .getString("description")
                    .split(" ")
                    .joinToString(" ") { it.replaceFirstChar { c -> c.uppercase() } }

                val emoji = weatherEmoji(condId)
                val result = WeatherInfo(tempC, condDesc, emoji)

                cachedLat    = lat
                cachedLon    = lon
                cachedResult = result
                cacheTime    = now

                result
            } catch (e: Exception) {
                Log.w(TAG, "Weather fetch failed: ${e.message}")
                null
            } finally {
                conn?.disconnect()
            }
        }

    private fun weatherEmoji(conditionId: Int): String = when {
        conditionId in 200..299 -> "⛈️"   // Thunderstorm
        conditionId in 300..399 -> "🌦️"   // Drizzle
        conditionId in 500..504 -> "🌧️"   // Rain
        conditionId == 511      -> "🌨️"   // Freezing rain
        conditionId in 512..599 -> "🌧️"   // Shower rain
        conditionId in 600..699 -> "❄️"   // Snow
        conditionId in 700..799 -> "🌫️"   // Atmosphere (fog, haze)
        conditionId == 800      -> "☀️"   // Clear sky
        conditionId == 801      -> "🌤️"   // Few clouds
        conditionId == 802      -> "⛅"   // Scattered clouds
        conditionId in 803..804 -> "☁️"   // Broken/overcast clouds
        else                    -> "🌡️"
    }
}
