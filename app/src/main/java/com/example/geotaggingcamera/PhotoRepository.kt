package com.example.geotaggingcamera

import android.content.Context
import java.io.File

class PhotoRepository(context: Context) {
    val storageDir: File = (context.getExternalFilesDir(null) ?: context.filesDir).also {
        if (!it.exists()) it.mkdirs()
    }

    fun listPhotos(): List<File> {
        return storageDir
            .listFiles { file -> file.isFile && file.extension.equals("jpg", ignoreCase = true) }
            ?.sortedByDescending { it.lastModified() }
            .orEmpty()
    }
}
