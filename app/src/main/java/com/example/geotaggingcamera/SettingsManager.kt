package com.example.geotaggingcamera

import android.content.Context
import android.content.SharedPreferences
import android.net.Uri

/**
 * Centralized SharedPreferences wrapper for all GeoProof Camera settings.
 * Single source of truth for overlay options, date/time formats, logo and weather config.
 */
class SettingsManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("geoproof_settings", Context.MODE_PRIVATE)

    companion object {
        // Overlay toggles
        const val KEY_SHOW_COORDINATES = "show_coordinates"
        const val KEY_SHOW_ADDRESS     = "show_address"
        const val KEY_SHOW_DATE        = "show_date"
        const val KEY_SHOW_TIME        = "show_time"
        const val KEY_SHOW_WEATHER     = "show_weather"
        const val KEY_SHOW_LOGO        = "show_logo"
        const val KEY_SHOW_MAP_TILE    = "show_map_tile"

        // Format preferences
        const val KEY_DATE_FORMAT  = "date_format"
        const val KEY_TIME_FORMAT  = "time_format"

        // Assets
        const val KEY_LOGO_URI     = "logo_uri"

        // Weather
        const val KEY_WEATHER_KEY  = "weather_api_key"

        // Date format options
        const val DATE_DMY   = "dd/MM/yyyy"
        const val DATE_MDY   = "MM/dd/yyyy"
        const val DATE_YMD   = "yyyy-MM-dd"
        const val DATE_LONG  = "dd MMM yyyy"

        // Time format options
        const val TIME_12H = "12h"
        const val TIME_24H = "24h"
    }

    // ── Overlay field visibility ──────────────────────────────────────────────

    var showCoordinates: Boolean
        get() = prefs.getBoolean(KEY_SHOW_COORDINATES, true)
        set(v) = prefs.edit().putBoolean(KEY_SHOW_COORDINATES, v).apply()

    var showAddress: Boolean
        get() = prefs.getBoolean(KEY_SHOW_ADDRESS, true)
        set(v) = prefs.edit().putBoolean(KEY_SHOW_ADDRESS, v).apply()

    var showDate: Boolean
        get() = prefs.getBoolean(KEY_SHOW_DATE, true)
        set(v) = prefs.edit().putBoolean(KEY_SHOW_DATE, v).apply()

    var showTime: Boolean
        get() = prefs.getBoolean(KEY_SHOW_TIME, true)
        set(v) = prefs.edit().putBoolean(KEY_SHOW_TIME, v).apply()

    var showWeather: Boolean
        get() = prefs.getBoolean(KEY_SHOW_WEATHER, true)
        set(v) = prefs.edit().putBoolean(KEY_SHOW_WEATHER, v).apply()

    var showLogo: Boolean
        get() = prefs.getBoolean(KEY_SHOW_LOGO, true)
        set(v) = prefs.edit().putBoolean(KEY_SHOW_LOGO, v).apply()

    var showMapTile: Boolean
        get() = prefs.getBoolean(KEY_SHOW_MAP_TILE, true)
        set(v) = prefs.edit().putBoolean(KEY_SHOW_MAP_TILE, v).apply()

    // ── Formats ───────────────────────────────────────────────────────────────

    var dateFormat: String
        get() = prefs.getString(KEY_DATE_FORMAT, DATE_DMY) ?: DATE_DMY
        set(v) = prefs.edit().putString(KEY_DATE_FORMAT, v).apply()

    var timeFormat: String
        get() = prefs.getString(KEY_TIME_FORMAT, TIME_12H) ?: TIME_12H
        set(v) = prefs.edit().putString(KEY_TIME_FORMAT, v).apply()

    // ── Company logo ──────────────────────────────────────────────────────────

    var logoUri: Uri?
        get() {
            val s = prefs.getString(KEY_LOGO_URI, null) ?: return null
            return try { Uri.parse(s) } catch (e: Exception) { null }
        }
        set(v) = prefs.edit().putString(KEY_LOGO_URI, v?.toString()).apply()

    // ── Weather API ───────────────────────────────────────────────────────────

    var weatherApiKey: String
        get() = prefs.getString(KEY_WEATHER_KEY, "") ?: ""
        set(v) = prefs.edit().putString(KEY_WEATHER_KEY, v).apply()

    val hasWeatherKey: Boolean get() = weatherApiKey.isNotBlank()
}
