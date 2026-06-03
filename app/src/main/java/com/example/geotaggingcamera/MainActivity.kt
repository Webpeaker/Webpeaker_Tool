package com.example.geotaggingcamera

import android.Manifest
import android.animation.ObjectAnimator
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.animation.OvershootInterpolator
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import com.google.android.gms.location.*
import kotlinx.coroutines.launch
import java.io.File
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.abs

class MainActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "GeoProof"
        private val REQUIRED_PERMISSIONS = arrayOf(
            Manifest.permission.CAMERA,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
        private const val PERMISSION_REQUEST = 100
        private const val FILENAME_FORMAT = "yyyyMMdd_HHmmss"
    }

    // Camera
    private lateinit var previewView: PreviewView
    private var imageCapture: ImageCapture? = null
    private var cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

    // Location
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private var currentLocation: Location? = null

    // UI
    private lateinit var tvLatitude: TextView
    private lateinit var tvLongitude: TextView
    private lateinit var tvAltitude: TextView
    private lateinit var tvAccuracy: TextView
    private lateinit var tvAddress: TextView
    private lateinit var tvGpsBadge: TextView
    private lateinit var tvPhotoCount: TextView
    private lateinit var tvSavingIndicator: TextView
    private lateinit var ivThumbnail: ImageView
    private lateinit var btnCapture: View
    private lateinit var btnFlip: View
    private lateinit var btnGallery: View
    private lateinit var btnSettings: View

    private lateinit var tvSubAddress: TextView
    private lateinit var tvLiveDateTime: TextView
    private lateinit var tvLiveWeather: TextView
    private lateinit var ivLiveMap: ImageView
    private lateinit var btnFlash: View
    private lateinit var ivFlashIcon: ImageView
    private lateinit var layoutCoords: View
    private lateinit var layoutAltAcc: View

    // Services
    private lateinit var watermarker: PhotoWatermarker
    private val weatherRepo = WeatherRepository()
    private var lastWeather: WeatherRepository.WeatherInfo? = null

    private var flashMode = ImageCapture.FLASH_MODE_OFF
    private var liveTimeJob: kotlinx.coroutines.Job? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        watermarker = PhotoWatermarker(this)
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        bindViews()
        setupClickListeners()

        if (allPermissionsGranted()) {
            startCamera()
            startLocationUpdates()
        } else {
            ActivityCompat.requestPermissions(this, REQUIRED_PERMISSIONS, PERMISSION_REQUEST)
        }

        refreshPhotoCount()
        refreshThumbnail()
    }

    private fun bindViews() {
        previewView        = findViewById(R.id.previewView)
        tvLatitude         = findViewById(R.id.tvLatitude)
        tvLongitude        = findViewById(R.id.tvLongitude)
        tvAltitude         = findViewById(R.id.tvAltitude)
        tvAccuracy         = findViewById(R.id.tvAccuracy)
        tvAddress          = findViewById(R.id.tvAddress)
        tvGpsBadge         = findViewById(R.id.tvGpsBadge)
        tvPhotoCount       = findViewById(R.id.tvPhotoCount)
        tvSavingIndicator  = findViewById(R.id.tvSavingIndicator)
        ivThumbnail        = findViewById(R.id.ivThumbnail)
        btnCapture         = findViewById(R.id.btnCapture)
        btnFlip            = findViewById(R.id.cardFlipCamera)
        btnGallery         = findViewById(R.id.cardThumbnail)
        btnSettings        = findViewById(R.id.btnSettings)

        tvSubAddress       = findViewById(R.id.tvSubAddress)
        tvLiveDateTime     = findViewById(R.id.tvLiveDateTime)
        tvLiveWeather      = findViewById(R.id.tvLiveWeather)
        ivLiveMap          = findViewById(R.id.ivLiveMap)
        btnFlash           = findViewById(R.id.btnFlash)
        ivFlashIcon        = findViewById(R.id.ivFlashIcon)
        layoutCoords       = findViewById(R.id.layoutCoords)
        layoutAltAcc       = findViewById(R.id.layoutAltAcc)
    }

    private fun setupClickListeners() {
        btnCapture.setOnClickListener { animateShutter(); takePhoto() }
        btnFlip.setOnClickListener    { flipCamera() }
        btnGallery.setOnClickListener {
            startActivity(Intent(this, GalleryActivity::class.java))
        }
        btnSettings.setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }
        btnFlash.setOnClickListener { toggleFlash() }
    }

    // ── Camera ────────────────────────────────────────────────────────────────

    private fun startCamera() {
        val providerFuture = ProcessCameraProvider.getInstance(this)
        providerFuture.addListener({
            try {
                val provider = providerFuture.get()
                val preview = Preview.Builder().build()
                    .also { it.setSurfaceProvider(previewView.surfaceProvider) }
                imageCapture = ImageCapture.Builder()
                    .setCaptureMode(ImageCapture.CAPTURE_MODE_MAXIMIZE_QUALITY)
                    .setFlashMode(flashMode)
                    .build()
                provider.unbindAll()
                provider.bindToLifecycle(this, cameraSelector, preview, imageCapture)
            } catch (e: Exception) {
                Log.e(TAG, "Camera bind failed", e)
                Toast.makeText(this, "Camera error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun flipCamera() {
        cameraSelector = if (cameraSelector == CameraSelector.DEFAULT_BACK_CAMERA)
            CameraSelector.DEFAULT_FRONT_CAMERA else CameraSelector.DEFAULT_BACK_CAMERA
        startCamera()
        // Flip animation
        ObjectAnimator.ofFloat(btnFlip, "rotationY", 0f, 360f).apply {
            duration = 400; start()
        }
    }

    private fun toggleFlash() {
        flashMode = when (flashMode) {
            ImageCapture.FLASH_MODE_OFF -> ImageCapture.FLASH_MODE_ON
            ImageCapture.FLASH_MODE_ON -> ImageCapture.FLASH_MODE_AUTO
            else -> ImageCapture.FLASH_MODE_OFF
        }
        imageCapture?.flashMode = flashMode
        updateFlashIcon()
    }

    private fun updateFlashIcon() {
        when (flashMode) {
            ImageCapture.FLASH_MODE_OFF -> {
                ivFlashIcon.setColorFilter(android.graphics.Color.WHITE)
                ivFlashIcon.alpha = 0.5f
            }
            ImageCapture.FLASH_MODE_ON -> {
                ivFlashIcon.setColorFilter(0xFFFFD600.toInt()) // Amber
                ivFlashIcon.alpha = 1.0f
            }
            ImageCapture.FLASH_MODE_AUTO -> {
                ivFlashIcon.setColorFilter(0xFF81D4FA.toInt()) // Light Blue
                ivFlashIcon.alpha = 1.0f
            }
        }
    }

    // ── Photo capture ─────────────────────────────────────────────────────────

    private fun takePhoto() {
        val capture = imageCapture ?: return
        if (currentLocation == null) {
            Toast.makeText(this, "⏳ Waiting for GPS fix…", Toast.LENGTH_SHORT).show()
            return
        }

        showSaving(true, "📸 Capturing…")

        val storageDir = getExternalFilesDir(null) ?: filesDir
        val timestamp  = SimpleDateFormat(FILENAME_FORMAT, Locale.US).format(Date())
        val photoFile  = File(storageDir, "GeoProof_$timestamp.jpg")
        val options    = ImageCapture.OutputFileOptions.Builder(photoFile).build()

        capture.takePicture(options, ContextCompat.getMainExecutor(this),
            object : ImageCapture.OnImageSavedCallback {
                override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                    val loc = currentLocation!!
                    showSaving(true, "🗺️ Adding geotag…")
                    lifecycleScope.launch {
                        try {
                            val weather = if (SettingsManager(this@MainActivity).showWeather
                                && SettingsManager(this@MainActivity).hasWeatherKey)
                                weatherRepo.getWeather(loc.latitude, loc.longitude,
                                    SettingsManager(this@MainActivity).weatherApiKey)
                            else null

                            val ok = watermarker.addWatermark(photoFile, loc, weather)
                            runOnUiThread {
                                showSaving(false, "")
                                if (ok) {
                                    Toast.makeText(this@MainActivity, "✅ Photo saved!", Toast.LENGTH_SHORT).show()
                                    refreshPhotoCount()
                                    refreshThumbnail()
                                } else {
                                    Toast.makeText(this@MainActivity, "⚠️ Saved (no geotag)", Toast.LENGTH_SHORT).show()
                                }
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "Watermark crash", e)
                            runOnUiThread { showSaving(false, "") }
                        }
                    }
                }
                override fun onError(e: ImageCaptureException) {
                    Log.e(TAG, "Capture failed", e)
                    showSaving(false, "")
                    Toast.makeText(this@MainActivity, "❌ Capture failed", Toast.LENGTH_SHORT).show()
                }
            })
    }

    // ── Location ──────────────────────────────────────────────────────────────

    @SuppressLint("MissingPermission")
    private fun startLocationUpdates() {
        val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 3000)
            .setMinUpdateIntervalMillis(1000).build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.lastLocation?.let { updateLocationUI(it) }
            }
        }
        fusedLocationClient.requestLocationUpdates(request, locationCallback, mainLooper)
        fusedLocationClient.lastLocation.addOnSuccessListener { loc ->
            loc?.let { updateLocationUI(it) }
        }
    }

    @SuppressLint("SetTextI18n")
    private fun updateLocationUI(location: Location) {
        currentLocation = location
        val ns = if (location.latitude  >= 0) "N" else "S"
        val ew = if (location.longitude >= 0) "E" else "W"
        tvLatitude.text  = "%.6f°$ns".format(abs(location.latitude))
        tvLongitude.text = "%.6f°$ew".format(abs(location.longitude))
        tvAltitude.text  = "%.1f m".format(location.altitude)
        tvAccuracy.text  = "±%.0f m".format(location.accuracy)

        val acc = location.accuracy
        tvGpsBadge.text = "● GPS ±${acc.toInt()}m"
        tvGpsBadge.setTextColor(when {
            acc <= 10  -> 0xFF00C853.toInt()  // green
            acc <= 30  -> 0xFFFFB300.toInt()  // amber
            else       -> 0xFFFF5252.toInt()  // red
        })

        val sm = SettingsManager(this)

        // Fetch live map tile using Glide if visible and API key is set
        if (sm.showMapTile && PhotoWatermarker.MAPS_API_KEY != "YOUR_GOOGLE_MAPS_API_KEY") {
            val url = "https://maps.googleapis.com/maps/api/staticmap" +
                    "?center=${location.latitude},${location.longitude}" +
                    "&zoom=17&size=256x256&maptype=satellite" +
                    "&markers=color:red%7C${location.latitude},${location.longitude}" +
                    "&key=${PhotoWatermarker.MAPS_API_KEY}"
            Glide.with(this).load(url)
                .placeholder(R.drawable.ic_photo_placeholder)
                .into(ivLiveMap)
        } else if (sm.showMapTile) {
            ivLiveMap.setImageResource(R.drawable.ic_photo_placeholder)
        }

        // Live Weather display
        if (sm.showWeather && sm.hasWeatherKey) {
            lifecycleScope.launch(kotlinx.coroutines.Dispatchers.IO) {
                try {
                    val weather = weatherRepo.getWeather(location.latitude, location.longitude, sm.weatherApiKey)
                    if (weather != null) {
                        runOnUiThread {
                            tvLiveWeather.text = weather.displayText
                            tvLiveWeather.visibility = View.VISIBLE
                        }
                    }
                } catch (_: Exception) {}
            }
        } else {
            tvLiveWeather.visibility = View.GONE
        }

        // Geocode address in background
        lifecycleScope.launch(kotlinx.coroutines.Dispatchers.IO) {
            try {
                @Suppress("DEPRECATION")
                val addr = android.location.Geocoder(this@MainActivity, Locale.getDefault())
                    .getFromLocation(location.latitude, location.longitude, 1)?.firstOrNull()
                if (addr != null) {
                    val city = addr.locality ?: addr.subAdminArea ?: addr.adminArea ?: ""
                    val state = addr.adminArea ?: ""
                    val country = addr.countryName ?: ""
                    val cityText = buildString {
                        if (city.isNotBlank()) append(city)
                        if (state.isNotBlank() && state != city) { if (isNotEmpty()) append(", "); append(state) }
                        if (country.isNotBlank()) { if (isNotEmpty()) append(", "); append(country) }
                    }.ifBlank { "Unknown Location" }
                    
                    val flag = try {
                        val code = addr.countryCode ?: ""
                        if (code.length == 2) {
                            val u = code.uppercase()
                            String(Character.toChars(u[0].code - 'A'.code + 0x1F1E6)) +
                                    String(Character.toChars(u[1].code - 'A'.code + 0x1F1E6))
                        } else ""
                    } catch (e: Exception) { "" }

                    val subParts = listOfNotNull(
                        addr.subLocality?.takeIf { it.isNotBlank() },
                        addr.thoroughfare?.takeIf { it.isNotBlank() },
                        addr.subAdminArea?.takeIf { it.isNotBlank() },
                        addr.postalCode?.takeIf { it.isNotBlank() }
                    ).distinct()
                    val subText = subParts.take(3).joinToString(", ")

                    runOnUiThread {
                        if (sm.showAddress) {
                            tvAddress.text = "📍 $cityText $flag"
                            tvSubAddress.text = subText.ifBlank { "No sub-address available" }
                            tvSubAddress.visibility = View.VISIBLE
                        } else {
                            tvAddress.text = "📍 Location hidden"
                            tvSubAddress.visibility = View.GONE
                        }
                    }
                }
            } catch (_: Exception) {}
        }
    }

    private fun startLiveClock() {
        liveTimeJob?.cancel()
        liveTimeJob = lifecycleScope.launch {
            val settings = SettingsManager(this@MainActivity)
            val tz = TimeZone.getDefault()
            val dateFmt = SimpleDateFormat(settings.dateFormat, Locale.getDefault()).apply { timeZone = tz }
            val timeFmt = SimpleDateFormat(
                if (settings.timeFormat == SettingsManager.TIME_12H) "hh:mm a" else "HH:mm",
                Locale.getDefault()
            ).apply { timeZone = tz }
            
            while (true) {
                val ms = System.currentTimeMillis()
                val off = tz.getOffset(ms)
                val sign = if (off >= 0) "+" else "-"
                val h = Math.abs(off) / 3_600_000
                val m = (Math.abs(off) % 3_600_000) / 60_000
                val gmt = "GMT $sign%02d:%02d".format(h, m)
                
                val dateStr = if (settings.showDate) dateFmt.format(Date(ms)) else ""
                val timeStr = if (settings.showTime) "${timeFmt.format(Date(ms))}  $gmt" else ""
                
                val fullText = buildString {
                    if (dateStr.isNotEmpty()) append(dateStr)
                    if (dateStr.isNotEmpty() && timeStr.isNotEmpty()) append("   ")
                    if (timeStr.isNotEmpty()) append(timeStr)
                }
                
                tvLiveDateTime.text = fullText
                tvLiveDateTime.visibility = if (fullText.isEmpty()) View.GONE else View.VISIBLE
                
                kotlinx.coroutines.delay(1000)
            }
        }
    }

    private fun applyLiveSettings() {
        val sm = SettingsManager(this)
        
        layoutCoords.visibility = if (sm.showCoordinates) View.VISIBLE else View.GONE
        layoutAltAcc.visibility = if (sm.showCoordinates) View.VISIBLE else View.GONE
        tvAddress.visibility = if (sm.showAddress) View.VISIBLE else View.GONE
        tvSubAddress.visibility = if (sm.showAddress) View.VISIBLE else View.GONE
        
        findViewById<View>(R.id.layoutLiveMap).visibility = if (sm.showMapTile) View.VISIBLE else View.GONE
        tvLiveWeather.visibility = if (sm.showWeather && sm.hasWeatherKey) View.VISIBLE else View.GONE
        
        currentLocation?.let { updateLocationUI(it) }
    }

    // ── UI helpers ────────────────────────────────────────────────────────────

    private fun animateShutter() {
        btnCapture.animate().scaleX(0.85f).scaleY(0.85f).setDuration(80)
            .withEndAction {
                btnCapture.animate().scaleX(1f).scaleY(1f)
                    .setDuration(150).setInterpolator(OvershootInterpolator()).start()
            }.start()
    }

    private fun showSaving(show: Boolean, msg: String) {
        tvSavingIndicator.text = msg
        tvSavingIndicator.visibility = if (show) View.VISIBLE else View.GONE
    }

    private fun refreshPhotoCount() {
        val dir = getExternalFilesDir(null) ?: filesDir
        val count = dir.listFiles { f -> f.name.endsWith(".jpg") }?.size ?: 0
        tvPhotoCount.text = if (count == 0) "" else "$count photo${if (count == 1) "" else "s"}"
    }

    private fun refreshThumbnail() {
        val dir = getExternalFilesDir(null) ?: filesDir
        val latest = dir.listFiles { f -> f.name.endsWith(".jpg") }
            ?.maxByOrNull { it.lastModified() }
        if (latest != null) {
            Glide.with(this).load(latest).centerCrop()
                .placeholder(R.drawable.ic_photo_placeholder).into(ivThumbnail)
        }
    }

    // ── Permissions ───────────────────────────────────────────────────────────

    private fun allPermissionsGranted() = REQUIRED_PERMISSIONS.all {
        ContextCompat.checkSelfPermission(this, it) == PackageManager.PERMISSION_GRANTED
    }

    override fun onRequestPermissionsResult(code: Int, perms: Array<String>, results: IntArray) {
        super.onRequestPermissionsResult(code, perms, results)
        if (code == PERMISSION_REQUEST && allPermissionsGranted()) {
            startCamera(); startLocationUpdates()
        } else {
            Toast.makeText(this, "Camera and Location permissions required", Toast.LENGTH_LONG).show()
        }
    }

    override fun onResume() {
        super.onResume()
        refreshPhotoCount()
        refreshThumbnail()
        applyLiveSettings()
        startLiveClock()
        updateFlashIcon()
    }

    override fun onPause() {
        super.onPause()
        liveTimeJob?.cancel()
    }

    override fun onDestroy() {
        super.onDestroy()
        if (::locationCallback.isInitialized) {
            fusedLocationClient.removeLocationUpdates(locationCallback)
        }
    }
}
