package com.example.geotaggingcamera

import android.app.AlertDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import com.github.chrisbanes.photoview.PhotoView
import java.io.File

class PhotoViewerActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_PHOTO_PATH = "photo_path"
    }

    private lateinit var photoView: PhotoView
    private lateinit var photoFile: File

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_photo_viewer)

        val path = intent.getStringExtra(EXTRA_PHOTO_PATH) ?: run { finish(); return }
        photoFile = File(path)

        photoView = findViewById(R.id.photoView)
        photoView.setImageURI(Uri.fromFile(photoFile))

        // Back
        findViewById<View>(R.id.btnViewerBack).setOnClickListener { finish() }

        // Share
        findViewById<View>(R.id.btnShare).setOnClickListener { sharePhoto() }

        // WhatsApp direct
        findViewById<View>(R.id.btnShareWhatsapp).setOnClickListener { shareToWhatsApp() }

        // Delete
        findViewById<View>(R.id.btnDelete).setOnClickListener { confirmDelete() }
    }

    private fun sharePhoto() {
        val uri = FileProvider.getUriForFile(
            this, "${packageName}.fileprovider", photoFile)
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "image/jpeg"
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        startActivity(Intent.createChooser(intent, "Share GeoProof Photo via…"))
    }

    private fun shareToWhatsApp() {
        val uri = FileProvider.getUriForFile(
            this, "${packageName}.fileprovider", photoFile)
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "image/jpeg"
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            setPackage("com.whatsapp")
        }
        try {
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "WhatsApp not installed", Toast.LENGTH_SHORT).show()
            sharePhoto()  // Fall back to generic share
        }
    }

    private fun confirmDelete() {
        AlertDialog.Builder(this)
            .setTitle("Delete Photo")
            .setMessage("Delete this photo permanently?")
            .setPositiveButton("Delete") { _, _ ->
                photoFile.delete()
                Toast.makeText(this, "Photo deleted", Toast.LENGTH_SHORT).show()
                finish()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
}
