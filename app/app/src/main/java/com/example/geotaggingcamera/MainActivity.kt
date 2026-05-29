package com.example.geotaggingcamera

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.location.Location
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.animation.AnimationUtils
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.exifinterface.media.ExifInterface
import com.example.geotaggingcamera.databinding.ActivityMainBinding
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import java.io.File
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import kotlin.math.abs

/**
 * MainActivity — Geotagging Camera
 *
 * Full pipeline:
 *   Permissions → Camera (Preview + ImageCapture) → Live Location → Capture → EXIF GPS write
 */
class MainActivity : AppCompatActivity() {

    // ── View binding ──────────────────────────────────────────────────────────
    private lateinit var binding: ActivityMainBinding

    // ── CameraX ───────────────────────────────────────────────────────────────
    private var imageCapture: ImageCapture? = null
    private var cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
    private lateinit var cameraExecutor: ExecutorService

    // ── Location ──────────────────────────────────────────────────────────────
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private var lastKnownLocation: Location? = null
    private var photoCount = 0

    private val locationCallback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            val location = result.lastLocation ?: return
            lastKnownLocation = location
            updateLocationOverlay(location)
        }
    }

    // ── Permissions ───────────────────────────────────────────────────────────
    private val requiredPermissions = arrayOf(
        Manifest.permission.CAMERA,
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_COARSE_LOCATION
    )

    private val permissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { grants ->
            if (grants.values.all { it }) {
                onPermissionsGranted()
            } else {
                binding.tvAccuracyBadge.text = "● No Permission"
                binding.tvAccuracyBadge.setTextColor(0xFFFF5252.toInt())
                binding.tvLatitude.text = "Camera & Location permissions required"
                binding.tvLongitude.text = "Please grant in Settings"
                Toast.makeText(this, "Permissions required for geotagging.", Toast.LENGTH_LONG).show()
            }
        }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        cameraExecutor = Executors.newSingleThreadExecutor()

        setupClickListeners()

        if (allPermissionsGranted()) onPermissionsGranted()
        else permissionLauncher.launch(requiredPermissions)
    }

    override fun onResume() {
        super.onResume()
        if (allPermissionsGranted()) startLocationUpdates()
    }

    override fun onPause() {
        super.onPause()
        fusedLocationClient.removeLocationUpdates(locationCallback)
    }

    override fun onDestroy() {
        super.onDestroy()
        cameraExecutor.shutdown()
    }

    // ── Click listeners ───────────────────────────────────────────────────────

    private fun setupClickListeners() {
        // Shutter button with scale animation
        binding.btnCapture.setOnClickListener {
            animateShutter()
            takePhoto()
        }

        // Flip camera button
        binding.cardFlipCamera.setOnClickListener {
            cameraSelector = if (cameraSelector == CameraSelector.DEFAULT_BACK_CAMERA) {
                CameraSelector.DEFAULT_FRONT_CAMERA
            } else {
                CameraSelector.DEFAULT_BACK_CAMERA
            }
            if (allPermissionsGranted()) startCamera()
        }

        // Tap thumbnail to open last photo (show toast with path)
        binding.cardThumbnail.setOnClickListener {
            Toast.makeText(this, "Photos saved to:\nAndroid/data/com.example.geotaggingcamera/files/", Toast.LENGTH_LONG).show()
        }
    }

    // ── Permission helpers ────────────────────────────────────────────────────

    private fun allPermissionsGranted() = requiredPermissions.all {
        ContextCompat.checkSelfPermission(this, it) == PackageManager.PERMISSION_GRANTED
    }

    private fun onPermissionsGranted() {
        startCamera()
        startLocationUpdates()
    }

    // ── Camera ────────────────────────────────────────────────────────────────

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder().build().also {
                it.setSurfaceProvider(binding.previewView.surfaceProvider)
            }

            imageCapture = ImageCapture.Builder()
                .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                .build()

            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(this, cameraSelector, preview, imageCapture)
                Log.d(TAG, "Camera bound: $cameraSelector")
            } catch (exc: Exception) {
                Log.e(TAG, "Camera binding failed", exc)
                Toast.makeText(this, "Camera failed to start.", Toast.LENGTH_SHORT).show()
            }
        }, ContextCompat.getMainExecutor(this))
    }

    // ── Location ──────────────────────────────────────────────────────────────

    @SuppressLint("MissingPermission")
    private fun startLocationUpdates() {
        val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, LOCATION_INTERVAL_MS)
            .setMinUpdateIntervalMillis(LOCATION_MIN_INTERVAL_MS)
            .build()

        fusedLocationClient.requestLocationUpdates(request, locationCallback, mainLooper)
    }

    // ── UI Updates ────────────────────────────────────────────────────────────

    private fun updateLocationOverlay(location: Location) {
        val lat = location.latitude
        val lon = location.longitude

        binding.tvLatitude.text  = "%.6f° %s".format(abs(lat), if (lat >= 0) "N" else "S")
        binding.tvLongitude.text = "%.6f° %s".format(abs(lon), if (lon >= 0) "E" else "W")
        binding.tvAltitude.text  = if (location.hasAltitude()) "%.1f m".format(location.altitude) else "—"
        binding.tvAccuracy.text  = "±%.1f m".format(location.accuracy)

        // Color the GPS badge based on accuracy
        val (badgeText, badgeColor) = when {
            location.accuracy <= 10f  -> "● GPS" to 0xFF4CAF50.toInt()   // Green: excellent
            location.accuracy <= 30f  -> "● GPS" to 0xFFFFEB3B.toInt()   // Yellow: ok
            else                      -> "● GPS" to 0xFFFF9800.toInt()   // Orange: poor
        }
        binding.tvAccuracyBadge.text = "$badgeText ±${"%.0f".format(location.accuracy)}m"
        binding.tvAccuracyBadge.setTextColor(badgeColor)
    }

    // ── Shutter animation ─────────────────────────────────────────────────────

    private fun animateShutter() {
        // Scale down then back up for a satisfying "click" feel
        binding.btnCapture.animate()
            .scaleX(0.85f).scaleY(0.85f)
            .setDuration(80)
            .withEndAction {
                binding.btnCapture.animate()
                    .scaleX(1f).scaleY(1f)
                    .setDuration(120)
                    .start()
            }.start()

        // Flash the ring briefly
        binding.shutterRing.animate()
            .alpha(0.3f).setDuration(80)
            .withEndAction {
                binding.shutterRing.animate().alpha(1f).setDuration(200).start()
            }.start()
    }

    // ── Photo capture pipeline ────────────────────────────────────────────────

    @SuppressLint("MissingPermission")
    private fun takePhoto() {
        val capture = imageCapture ?: run {
            Toast.makeText(this, "Camera not ready.", Toast.LENGTH_SHORT).show()
            return
        }

        // Disable button & show saving indicator
        binding.btnCapture.isEnabled = false
        showSavingIndicator(true)

        // Prepare output file
        val timestamp = SimpleDateFormat(FILENAME_FORMAT, Locale.US).format(System.currentTimeMillis())
        val photoFile = File(getExternalFilesDir(null), "GeoPhoto_$timestamp.jpg")
        val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()

        // Get a fresh location fix right before capture
        fusedLocationClient
            .getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, null)
            .addOnCompleteListener(this) { locationTask ->
                val location: Location? = if (locationTask.isSuccessful) {
                    locationTask.result ?: lastKnownLocation
                } else {
                    lastKnownLocation
                }

                capture.takePicture(
                    outputOptions,
                    ContextCompat.getMainExecutor(this),
                    object : ImageCapture.OnImageSavedCallback {

                        override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                            showSavingIndicator(false)

                            if (location != null) {
                                writeExifGps(photoFile, location)
                                photoCount++
                                updatePhotoCounter()
                                updateThumbnail(photoFile)

                                val lat = "%.4f".format(abs(location.latitude))
                                val lon = "%.4f".format(abs(location.longitude))
                                Toast.makeText(
                                    applicationContext,
                                    "✓ Photo #$photoCount geotagged!\n$lat° ${if (location.latitude >= 0) "N" else "S"}, $lon° ${if (location.longitude >= 0) "E" else "W"}",
                                    Toast.LENGTH_LONG
                                ).show()
                            } else {
                                photoCount++
                                updatePhotoCounter()
                                updateThumbnail(photoFile)
                                Toast.makeText(
                                    applicationContext,
                                    "Photo saved (no GPS available).\n${photoFile.name}",
                                    Toast.LENGTH_LONG
                                ).show()
                                Log.w(TAG, "Location null — EXIF GPS not written")
                            }

                            binding.btnCapture.isEnabled = true
                        }

                        override fun onError(exc: ImageCaptureException) {
                            showSavingIndicator(false)
                            Log.e(TAG, "Capture failed", exc)
                            Toast.makeText(applicationContext, "Capture failed: ${exc.message}", Toast.LENGTH_SHORT).show()
                            binding.btnCapture.isEnabled = true
                        }
                    }
                )
            }
    }

    private fun showSavingIndicator(show: Boolean) {
        binding.tvSavingIndicator.visibility = if (show) View.VISIBLE else View.GONE
    }

    private fun updatePhotoCounter() {
        binding.tvPhotoCount.text = if (photoCount == 1) "1 photo" else "$photoCount photos"
    }

    /** Load the last saved photo as a thumbnail in the bottom-left corner */
    private fun updateThumbnail(file: File) {
        try {
            val opts = BitmapFactory.Options().apply { inSampleSize = 4 }
            val bmp = BitmapFactory.decodeFile(file.absolutePath, opts)
            if (bmp != null) binding.ivThumbnail.setImageBitmap(bmp)
        } catch (e: Exception) {
            Log.w(TAG, "Thumbnail load failed", e)
        }
    }

    // ── EXIF GPS writing ──────────────────────────────────────────────────────

    /**
     * Writes GPS EXIF tags into [photoFile].
     *
     * EXIF GPS coordinate format:
     *   - Unsigned DMS rational string: "DEG/1,MIN/1,SECNUM/1000000"
     *   - Sign is encoded via _REF tag: "N"/"S" for latitude, "E"/"W" for longitude
     */
    private fun writeExifGps(photoFile: File, location: Location) {
        try {
            val exif = ExifInterface(photoFile.absolutePath)

            // Latitude
            exif.setAttribute(ExifInterface.TAG_GPS_LATITUDE_REF, if (location.latitude >= 0) "N" else "S")
            exif.setAttribute(ExifInterface.TAG_GPS_LATITUDE, decimalToDmsRational(abs(location.latitude)))

            // Longitude
            exif.setAttribute(ExifInterface.TAG_GPS_LONGITUDE_REF, if (location.longitude >= 0) "E" else "W")
            exif.setAttribute(ExifInterface.TAG_GPS_LONGITUDE, decimalToDmsRational(abs(location.longitude)))

            // Altitude (optional)
            if (location.hasAltitude()) {
                exif.setAttribute(ExifInterface.TAG_GPS_ALTITUDE_REF, if (location.altitude >= 0) "0" else "1")
                exif.setAttribute(ExifInterface.TAG_GPS_ALTITUDE, "${abs(location.altitude).toLong()}/1")
            }

            // GPS timestamp
            val gpsTime = location.time
            val dateSdf = SimpleDateFormat("yyyy:MM:dd", Locale.US).also {
                it.timeZone = java.util.TimeZone.getTimeZone("UTC")
            }
            exif.setAttribute(ExifInterface.TAG_GPS_DATESTAMP, dateSdf.format(gpsTime))

            val cal = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("UTC"))
            cal.timeInMillis = gpsTime
            exif.setAttribute(
                ExifInterface.TAG_GPS_TIMESTAMP,
                "${cal.get(java.util.Calendar.HOUR_OF_DAY)}/1," +
                        "${cal.get(java.util.Calendar.MINUTE)}/1," +
                        "${cal.get(java.util.Calendar.SECOND)}/1"
            )

            exif.saveAttributes()
            Log.d(TAG, "EXIF GPS written → lat=${location.latitude} lon=${location.longitude}")
        } catch (e: Exception) {
            Log.e(TAG, "EXIF write failed", e)
        }
    }

    /**
     * Converts an absolute decimal-degree value to a DMS rational string.
     *
     * Formula:
     *   degrees = floor(|decimal|)
     *   minutes = floor((|decimal| - degrees) × 60)
     *   seconds = ((|decimal| - degrees) × 60 - minutes) × 60
     *
     * Stored as: "DEG/1,MIN/1,SEC_NUMERATOR/1000000"
     * (seconds multiplied by 1,000,000 for sub-arcsecond precision)
     */
    private fun decimalToDmsRational(decimalDegrees: Double): String {
        val degrees = decimalDegrees.toInt()
        val remainingMin = (decimalDegrees - degrees) * 60.0
        val minutes = remainingMin.toInt()
        val secondsNumerator = ((remainingMin - minutes) * 60.0 * 1_000_000).toLong()
        return "$degrees/1,$minutes/1,$secondsNumerator/1000000"
    }

    companion object {
        private const val TAG = "GeotagCam"
        private const val FILENAME_FORMAT = "yyyyMMdd_HHmmss"
        private const val LOCATION_INTERVAL_MS = 3_000L
        private const val LOCATION_MIN_INTERVAL_MS = 1_000L
    }
}
