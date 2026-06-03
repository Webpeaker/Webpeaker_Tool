package com.example.geotaggingcamera

import android.content.Context
import android.net.Uri

class AppSettings(context: Context) {
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    var companyName: String
        get() = prefs.getString(KEY_COMPANY_NAME, "GeoProof Camera") ?: "GeoProof Camera"
        set(value) = prefs.edit().putString(KEY_COMPANY_NAME, value.trim().ifBlank { "GeoProof Camera" }).apply()

    var logoUri: String?
        get() = prefs.getString(KEY_LOGO_URI, null)
        set(value) = prefs.edit().putString(KEY_LOGO_URI, value).apply()

    var dateFormat: String
        get() = prefs.getString(KEY_DATE_FORMAT, "dd/MM/yyyy") ?: "dd/MM/yyyy"
        set(value) = prefs.edit().putString(KEY_DATE_FORMAT, value).apply()

    var use24HourTime: Boolean
        get() = prefs.getBoolean(KEY_24_HOUR, false)
        set(value) = prefs.edit().putBoolean(KEY_24_HOUR, value).apply()

    var showAddress: Boolean
        get() = prefs.getBoolean(KEY_SHOW_ADDRESS, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_ADDRESS, value).apply()

    var showCoordinates: Boolean
        get() = prefs.getBoolean(KEY_SHOW_COORDS, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_COORDS, value).apply()

    var showAltitude: Boolean
        get() = prefs.getBoolean(KEY_SHOW_ALTITUDE, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_ALTITUDE, value).apply()

    var showAccuracy: Boolean
        get() = prefs.getBoolean(KEY_SHOW_ACCURACY, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_ACCURACY, value).apply()

    var showWeather: Boolean
        get() = prefs.getBoolean(KEY_SHOW_WEATHER, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_WEATHER, value).apply()

    val parsedLogoUri: Uri?
        get() = logoUri?.let(Uri::parse)

    companion object {
        private const val PREFS_NAME = "geo_proof_settings"
        private const val KEY_COMPANY_NAME = "company_name"
        private const val KEY_LOGO_URI = "logo_uri"
        private const val KEY_DATE_FORMAT = "date_format"
        private const val KEY_24_HOUR = "use_24_hour"
        private const val KEY_SHOW_ADDRESS = "show_address"
        private const val KEY_SHOW_COORDS = "show_coords"
        private const val KEY_SHOW_ALTITUDE = "show_altitude"
        private const val KEY_SHOW_ACCURACY = "show_accuracy"
        private const val KEY_SHOW_WEATHER = "show_weather"

        val DATE_FORMATS = listOf("dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd", "dd MMM yyyy")
    }
}
