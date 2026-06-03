package com.example.geotaggingcamera

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.bumptech.glide.Glide

class SettingsActivity : AppCompatActivity() {

    private lateinit var settings: SettingsManager

    // Overlay toggles
    private lateinit var swCoordinates: Switch
    private lateinit var swAddress: Switch
    private lateinit var swDate: Switch
    private lateinit var swTime: Switch
    private lateinit var swWeather: Switch
    private lateinit var swMapTile: Switch

    // Formats
    private lateinit var spinnerDate: Spinner
    private lateinit var spinnerTime: Spinner

    // Weather
    private lateinit var etWeatherKey: EditText
    private lateinit var btnSaveWeather: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        settings = SettingsManager(this)
        bindViews()
        loadCurrentValues()
        setupListeners()

        // Back button
        findViewById<android.view.View>(R.id.btnSettingsBack).setOnClickListener { finish() }
    }

    private fun bindViews() {
        swCoordinates  = findViewById(R.id.swCoordinates)
        swAddress      = findViewById(R.id.swAddress)
        swDate         = findViewById(R.id.swDate)
        swTime         = findViewById(R.id.swTime)
        swWeather      = findViewById(R.id.swWeather)
        swMapTile      = findViewById(R.id.swMapTile)
        spinnerDate    = findViewById(R.id.spinnerDateFormat)
        spinnerTime    = findViewById(R.id.spinnerTimeFormat)
        etWeatherKey   = findViewById(R.id.etWeatherKey)
        btnSaveWeather = findViewById(R.id.btnSaveWeather)
    }

    private fun loadCurrentValues() {
        swCoordinates.isChecked = settings.showCoordinates
        swAddress.isChecked     = settings.showAddress
        swDate.isChecked        = settings.showDate
        swTime.isChecked        = settings.showTime
        swWeather.isChecked     = settings.showWeather
        swMapTile.isChecked     = settings.showMapTile
        etWeatherKey.setText(settings.weatherApiKey)

        // Date format spinner
        val dateFormats = listOf(
            SettingsManager.DATE_DMY,
            SettingsManager.DATE_MDY,
            SettingsManager.DATE_YMD,
            SettingsManager.DATE_LONG
        )
        val dateLabels = listOf("DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD MMM YYYY")
        spinnerDate.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, dateLabels)
        spinnerDate.setSelection(dateFormats.indexOf(settings.dateFormat).coerceAtLeast(0))

        // Time format spinner
        val timeLabels = listOf("12-hour (09:34 AM)", "24-hour (21:34)")
        spinnerTime.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, timeLabels)
        spinnerTime.setSelection(if (settings.timeFormat == SettingsManager.TIME_12H) 0 else 1)
    }

    private fun setupListeners() {
        swCoordinates.setOnCheckedChangeListener { _, v -> settings.showCoordinates = v }
        swAddress.setOnCheckedChangeListener     { _, v -> settings.showAddress = v }
        swDate.setOnCheckedChangeListener        { _, v -> settings.showDate = v }
        swTime.setOnCheckedChangeListener        { _, v -> settings.showTime = v }
        swWeather.setOnCheckedChangeListener     { _, v -> settings.showWeather = v }
        swMapTile.setOnCheckedChangeListener     { _, v -> settings.showMapTile = v }

        val dateFormats = listOf(SettingsManager.DATE_DMY, SettingsManager.DATE_MDY,
            SettingsManager.DATE_YMD, SettingsManager.DATE_LONG)
        spinnerDate.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(p: AdapterView<*>?, v: android.view.View?, pos: Int, id: Long) {
                settings.dateFormat = dateFormats[pos]
            }
            override fun onNothingSelected(p: AdapterView<*>?) {}
        }

        spinnerTime.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(p: AdapterView<*>?, v: android.view.View?, pos: Int, id: Long) {
                settings.timeFormat = if (pos == 0) SettingsManager.TIME_12H else SettingsManager.TIME_24H
            }
            override fun onNothingSelected(p: AdapterView<*>?) {}
        }

        btnSaveWeather.setOnClickListener {
            val key = etWeatherKey.text.toString().trim()
            settings.weatherApiKey = key
            Toast.makeText(this, if (key.isBlank()) "Weather key cleared" else "✅ API key saved!", Toast.LENGTH_SHORT).show()
        }
    }
}
