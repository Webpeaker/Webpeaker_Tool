package com.example.geotaggingcamera

import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView

class GalleryActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var tvEmpty: TextView
    private lateinit var tvEmptyMsg: TextView
    private lateinit var tvCount: TextView
    private lateinit var adapter: GeoPhotoAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_gallery)

        recyclerView = findViewById(R.id.rvPhotos)
        tvEmpty      = findViewById(R.id.tvEmptyTitle)
        tvEmptyMsg   = findViewById(R.id.tvEmptyMsg)
        tvCount      = findViewById(R.id.tvPhotoCount)

        // Back button
        findViewById<View>(R.id.btnBack).setOnClickListener { finish() }

        setupRecyclerView()
        loadPhotos()
    }

    private fun setupRecyclerView() {
        adapter = GeoPhotoAdapter(
            mutableListOf(),
            onPhotoClick  = { photo, _ -> openViewer(photo) },
            onPhotoLongClick = { photo, pos -> confirmDelete(photo, pos) }
        )
        recyclerView.layoutManager = GridLayoutManager(this, 3)
        recyclerView.adapter = adapter
    }

    private fun loadPhotos() {
        val dir = getExternalFilesDir(null) ?: filesDir
        val photos = (dir.listFiles { f -> f.name.endsWith(".jpg") } ?: emptyArray())
            .sortedByDescending { it.lastModified() }
            .map { GeoPhoto(it) }

        adapter.updatePhotos(photos)

        val count = photos.size
        tvCount.text = if (count == 0) "" else "$count photo${if (count == 1) "" else "s"}"

        // Show/hide empty state
        val isEmpty = photos.isEmpty()
        recyclerView.visibility = if (isEmpty) View.GONE  else View.VISIBLE
        tvEmpty.visibility      = if (isEmpty) View.VISIBLE else View.GONE
        tvEmptyMsg.visibility   = if (isEmpty) View.VISIBLE else View.GONE
    }

    private fun openViewer(photo: GeoPhoto) {
        val intent = Intent(this, PhotoViewerActivity::class.java)
        intent.putExtra(PhotoViewerActivity.EXTRA_PHOTO_PATH, photo.absolutePath)
        startActivity(intent)
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
    }

    private fun confirmDelete(photo: GeoPhoto, position: Int) {
        AlertDialog.Builder(this)
            .setTitle("Delete Photo")
            .setMessage("Delete this geotagged photo permanently?")
            .setPositiveButton("Delete") { _, _ ->
                photo.file.delete()
                adapter.removeAt(position)
                loadPhotos()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    override fun onResume() {
        super.onResume()
        loadPhotos()
    }
}
