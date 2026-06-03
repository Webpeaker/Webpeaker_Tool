package com.example.geotaggingcamera

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import kotlin.math.roundToInt

data class WeatherInfo(
    val temperatureC: Int,
    val condition: String
)

class WeatherService {
    suspend fun getCurrentWeather(lat: Double, lon: Double): WeatherInfo? = withContext(Dispatchers.IO) {
        var connection: HttpURLConnection? = null
        try {
            val url = URL(
                "https://api.open-meteo.com/v1/forecast" +
                    "?latitude=$lat&longitude=$lon&current=temperature_2m,weather_code"
            )
            connection = (url.openConnection() as HttpURLConnection).apply {
                connectTimeout = TIMEOUT_MS
                readTimeout = TIMEOUT_MS
            }
            if (connection.responseCode != 200) return@withContext null

            val body = connection.inputStream.bufferedReader().use { it.readText() }
            val current = JSONObject(body).getJSONObject("current")
            WeatherInfo(
                temperatureC = current.getDouble("temperature_2m").roundToInt(),
                condition = conditionForCode(current.optInt("weather_code", -1))
            )
        } catch (e: Exception) {
            Log.w(TAG, "Weather unavailable: ${e.message}")
            null
        } finally {
            connection?.disconnect()
        }
    }

    private fun conditionForCode(code: Int): String = when (code) {
        0 -> "Clear"
        1, 2 -> "Partly cloudy"
        3 -> "Cloudy"
        45, 48 -> "Fog"
        51, 53, 55, 56, 57 -> "Drizzle"
        61, 63, 65, 66, 67, 80, 81, 82 -> "Rain"
        71, 73, 75, 77, 85, 86 -> "Snow"
        95, 96, 99 -> "Thunderstorm"
        else -> "Weather"
    }

    companion object {
        private const val TAG = "WeatherService"
        private const val TIMEOUT_MS = 6_000
    }
}
