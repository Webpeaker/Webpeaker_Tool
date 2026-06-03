package com.example.geotaggingcamera

import java.io.File

/** Represents a single geotagged photo saved by GeoProof Camera. */
data class GeoPhoto(
    val file: File,
    val name: String = file.name,
    val sizeBytes: Long = file.length(),
    val lastModified: Long = file.lastModified()
) {
    val absolutePath: String get() = file.absolutePath
}
