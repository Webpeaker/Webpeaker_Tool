package com.example.geotaggingcamera

import android.content.Context
import android.graphics.*
import android.location.Address
import android.location.Geocoder
import android.location.Location
import android.net.Uri
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.abs
import kotlin.math.min

/**
 * GeoProof Camera — Photo Watermarker v2
 *
 * Stamps a branded GPS info panel (Option A: full bottom panel) onto captured JPEGs.
 * All fields are controlled by SettingsManager toggles.
 *
 * Panel design:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ [Logo]  GeoProof Camera                  📷 Verified ✓     │
 * │ [Map ]  📍 Bijainagar, Rajasthan, India 🇮🇳                 │
 * │  tile   Moti Nagar, Bijainagar 305624, India                │
 * │         Lat 25.9224° N   Long 74.6377° E                   │
 * │         31 May 2026   09:34 AM   GMT +05:30                 │
 * │         🌤️ 38°C  Partly Cloudy                             │
 * └─────────────────────────────────────────────────────────────┘
 */
class PhotoWatermarker(private val context: Context) {

    companion object {
        private const val TAG = "PhotoWatermarker"
        const val MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"
        private const val MAX_LONG_SIDE = 2048
        private const val NET_TIMEOUT  = 8_000
    }

    private val settings = SettingsManager(context)
    private val density  = context.resources.displayMetrics.density
    private fun dp(v: Float) = (v * density).toInt()
    private fun dpf(v: Float) = v * density

    // ─── Public entry point ───────────────────────────────────────────────────

    suspend fun addWatermark(
        photoFile: File,
        location: Location,
        weatherInfo: WeatherRepository.WeatherInfo? = null
    ): Boolean = withContext(Dispatchers.IO) {
        val temp = File(photoFile.parent, "wm_tmp_${photoFile.name}")
        try {
            val photo = decodeSampled(photoFile) ?: return@withContext false
            val address = getAddress(location.latitude, location.longitude)
            
            // Base scale on photo width (reference: 1080px)
            val scale = (photo.width.toFloat() / 1080f).coerceIn(0.5f, 3.0f)
            
            val mapTile = if (settings.showMapTile) fetchMapTile(location) else null
            val logoImg = loadBuiltInLogo(scale)

            val result = drawOverlay(photo, address, mapTile, logoImg, weatherInfo, location, scale)

            FileOutputStream(temp).use { out ->
                result.compress(Bitmap.CompressFormat.JPEG, 93, out)
                out.flush()
            }
            if (!temp.renameTo(photoFile)) {
                temp.copyTo(photoFile, overwrite = true); temp.delete()
            }

            photo.recycle(); mapTile?.recycle(); result.recycle(); logoImg?.recycle()
            true
        } catch (e: Exception) {
            Log.e(TAG, "Watermark failed", e)
            temp.delete(); false
        }
    }

    // ─── Bitmap loading (2-pass downsampling to avoid OOM) ───────────────────

    private fun decodeSampled(file: File): Bitmap? {
        return try {
            val o1 = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            BitmapFactory.decodeFile(file.absolutePath, o1)
            val longSide = maxOf(o1.outWidth, o1.outHeight)
            if (longSide <= 0) return null
            var s = 1
            while (longSide / (s * 2) >= MAX_LONG_SIDE) s *= 2
            BitmapFactory.decodeFile(file.absolutePath,
                BitmapFactory.Options().apply { inSampleSize = s; inPreferredConfig = Bitmap.Config.ARGB_8888 })
        } catch (e: Exception) { Log.e(TAG, "decode failed", e); null }
    }

    // ─── Geocoding ────────────────────────────────────────────────────────────

    @Suppress("DEPRECATION")
    private fun getAddress(lat: Double, lon: Double): Address? = try {
        Geocoder(context, Locale.getDefault()).getFromLocation(lat, lon, 1)?.firstOrNull()
    } catch (e: Exception) { null }

    // ─── Satellite map tile ───────────────────────────────────────────────────

    private fun fetchMapTile(location: Location): Bitmap? {
        if (MAPS_API_KEY == "YOUR_GOOGLE_MAPS_API_KEY") return null
        var conn: HttpURLConnection? = null
        return try {
            val url = "https://maps.googleapis.com/maps/api/staticmap" +
                    "?center=${location.latitude},${location.longitude}" +
                    "&zoom=17&size=256x256&maptype=satellite" +
                    "&markers=color:red%7C${location.latitude},${location.longitude}" +
                    "&key=$MAPS_API_KEY"
            conn = (URL(url).openConnection() as HttpURLConnection).apply {
                connectTimeout = NET_TIMEOUT; readTimeout = NET_TIMEOUT; connect()
            }
            if (conn.responseCode == 200) BitmapFactory.decodeStream(conn.inputStream) else null
        } catch (e: Exception) { null } finally { conn?.disconnect() }
    }

    // ─── Logo loading ─────────────────────────────────────────────────────────

    private fun loadBuiltInLogo(scale: Float): Bitmap? {
        return try {
            val raw = BitmapFactory.decodeResource(context.resources, R.drawable.ic_company_logo)
                ?: return null
            val h = (24f * scale).toInt().coerceAtLeast(1)
            val w = (h.toFloat() / raw.height * raw.width).toInt().coerceAtLeast(1)
            Bitmap.createScaledBitmap(raw, w, h, true).also { raw.recycle() }
        } catch (e: Exception) { null }
    }

    // ─── Main drawing ─────────────────────────────────────────────────────────

    private fun drawOverlay(
        photo: Bitmap,
        address: Address?,
        mapTile: Bitmap?,
        logo: Bitmap?,
        weather: WeatherRepository.WeatherInfo?,
        location: Location,
        scale: Float
    ): Bitmap {
        val outW = photo.width
        val outH = photo.height

        val result = Bitmap.createBitmap(outW, outH, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(result)

        // Draw original photo
        canvas.drawBitmap(photo, 0f, 0f, null)

        // Layout constants scaled to photo resolution
        val cardPadLeft = 14f * scale
        val cardPadRight = 14f * scale
        val cardPadTop = 12f * scale
        val cardPadBottom = 12f * scale
        val margin = 24f * scale
        val mapSz = 80f * scale
        val pad = 12f * scale
        val rowSpacing = 3f * scale
        val sectionSpacing = 5f * scale
        
        // Define Paints dynamically based on scale
        val titlePaint = Paint().apply {
            color = 0xFF42A5F5.toInt() // Premium blue accent
            textSize = 12f * scale
            isFakeBoldText = true
            isAntiAlias = true
        }

        val verifiedPaint = Paint().apply {
            color = 0xFF00C853.toInt() // Material Green
            textSize = 9.5f * scale
            isFakeBoldText = true
            isAntiAlias = true
            textAlign = Paint.Align.RIGHT
        }

        val cityPaint = Paint().apply {
            color = Color.WHITE
            textSize = 12.5f * scale
            isFakeBoldText = true
            isAntiAlias = true
        }

        val subPaint = Paint().apply {
            color = 0xFFB0BEC5.toInt() // Blue grey light
            textSize = 10f * scale
            isAntiAlias = true
        }

        val coordPaint = Paint().apply {
            color = Color.WHITE
            textSize = 10.5f * scale
            typeface = Typeface.MONOSPACE
            isAntiAlias = true
        }

        val dateTimePaint = Paint().apply {
            color = 0xFFB3FFFFFF.toInt() // Translucent white
            textSize = 10f * scale
            isAntiAlias = true
        }

        val weatherPaint = Paint().apply {
            color = 0xFFB3FFFFFF.toInt()
            textSize = 10f * scale
            isAntiAlias = true
        }

        // Calculate Header row height
        val logoH = logo?.height?.toFloat() ?: 0f
        val headerH = maxOf(logoH, titlePaint.textSize).coerceAtLeast(20f * scale)

        // Gather address data if requested
        val city = if (address != null) buildCity(address) else ""
        val flag = if (address != null) flagEmoji(address.countryCode ?: "") else ""
        val subText = if (address != null) buildSub(address) else ""
        
        val maxTextWidthBase = 220f * scale
        val subLines = if (settings.showAddress && subText.isNotBlank()) {
            wrapText(subText, subPaint, maxTextWidthBase)
        } else {
            emptyList()
        }

        // Calculate dynamic card content height
        var textHeight = headerH
        if (settings.showAddress && address != null) {
            textHeight += sectionSpacing + cityPaint.textSize
            if (subLines.isNotEmpty()) {
                textHeight += subLines.size * (subPaint.textSize + rowSpacing)
            }
        }
        if (settings.showCoordinates) {
            textHeight += sectionSpacing + coordPaint.textSize
        }
        if (settings.showDate || settings.showTime) {
            textHeight += sectionSpacing + dateTimePaint.textSize
        }
        if (settings.showWeather && weather != null) {
            textHeight += sectionSpacing + weatherPaint.textSize
        }

        // Card Content Box Size
        val cardContentH = if (settings.showMapTile) maxOf(mapSz, textHeight) else textHeight
        val cardH = cardContentH + cardPadTop + cardPadBottom

        // Measure dynamic text widths to size the card width properly
        val logoW = logo?.width?.toFloat() ?: 0f
        val headerTextW = titlePaint.measureText("GeoProof Camera")
        val verifiedTextW = verifiedPaint.measureText("✓ Verified")
        val headerW = logoW + (if (logo != null) 6f * scale else 0f) + headerTextW + 16f * scale + verifiedTextW

        val cityText = "📍 $city $flag"
        val cityTextW = if (settings.showAddress && address != null) cityPaint.measureText(cityText) else 0f
        val subMaxW = subLines.maxOfOrNull { subPaint.measureText(it) } ?: 0f
        
        val coordText = if (settings.showCoordinates) {
            val ns = if (location.latitude >= 0) "N" else "S"
            val ew = if (location.longitude >= 0) "E" else "W"
            "Lat %.4f°$ns   Long %.4f°$ew".format(abs(location.latitude), abs(location.longitude))
        } else ""
        val coordW = if (settings.showCoordinates) coordPaint.measureText(coordText) else 0f

        val dtText = if (settings.showDate || settings.showTime) buildDateTime(location) else ""
        val dtW = if (settings.showDate || settings.showTime) dateTimePaint.measureText(dtText) else 0f

        val weatherText = if (settings.showWeather && weather != null) weather.displayText else ""
        val weatherW = if (settings.showWeather && weather != null) weatherPaint.measureText(weatherText) else 0f

        val maxTextWidth = listOf(headerW, cityTextW, subMaxW, coordW, dtW, weatherW)
            .maxOrNull() ?: (180f * scale)

        val cardContentW = if (settings.showMapTile) mapSz + pad + maxTextWidth else maxTextWidth
        val cardW = (cardContentW + cardPadLeft + cardPadRight).coerceAtMost(outW - margin * 2f)

        // Bounding Box position (Bottom-Right)
        val cardX = outW - cardW - margin
        val cardY = outH - cardH - margin

        // Draw Translucent Card Background
        val cardRect = RectF(cardX, cardY, cardX + cardW, cardY + cardH)
        val cardBgPaint = Paint().apply {
            color = 0xCF0B162C.toInt() // 81% opaque deep dark blue
            style = Paint.Style.FILL
            isAntiAlias = true
        }
        val cornerRadius = 10f * scale
        canvas.drawRoundRect(cardRect, cornerRadius, cornerRadius, cardBgPaint)

        // Draw Subtle Card Border
        val borderPaint = Paint().apply {
            color = 0x2EFFFFFF.toInt() // 18% white border
            style = Paint.Style.STROKE
            strokeWidth = 1f * scale
            isAntiAlias = true
        }
        canvas.drawRoundRect(cardRect, cornerRadius, cornerRadius, borderPaint)

        // Draw Map Tile (if requested)
        if (settings.showMapTile) {
            val mapX = cardX + cardPadLeft
            val mapY = cardY + cardPadTop + (cardContentH - mapSz) / 2f
            val mapRect = RectF(mapX, mapY, mapX + mapSz, mapY + mapSz)

            if (mapTile != null) {
                drawRoundedBitmap(canvas, mapTile, mapRect, 6f * scale)
                // "Google" attribution shadow/label
                canvas.drawText("Google", mapX + 4f * scale, mapY + mapSz - 4f * scale,
                    Paint().apply {
                        color = Color.WHITE; textSize = 7.5f * scale; isFakeBoldText = true
                        isAntiAlias = true; setShadowLayer(1.5f, 0.8f, 0.8f, Color.BLACK)
                    })
            } else {
                // Location placeholder
                canvas.drawRoundRect(mapRect, 6f * scale, 6f * scale,
                    Paint().apply { color = 0xFF162447.toInt() })
                canvas.drawText("📍", mapX + mapSz / 2f, mapY + mapSz / 2f + 8f * scale,
                    Paint().apply { textSize = 24f * scale; textAlign = Paint.Align.CENTER; isAntiAlias = true })
            }
        }

        // Draw Text Columns
        val textStartX = cardX + cardPadLeft + (if (settings.showMapTile) mapSz + pad else 0f)
        var currentY = cardY + cardPadTop
        
        // Vertically center text box if map tile layout is larger
        if (settings.showMapTile && textHeight < mapSz) {
            currentY += (mapSz - textHeight) / 2f
        }

        // 1. Header row (Logo + Title + Verified Badge)
        val fmTitle = titlePaint.fontMetrics
        val titleBaseline = currentY + headerH / 2f - (fmTitle.ascent + fmTitle.descent) / 2f

        if (logo != null) {
            val logoY = currentY + (headerH - logo.height) / 2f
            canvas.drawBitmap(logo, textStartX, logoY, null)
            val titleX = textStartX + logo.width + 5f * scale
            canvas.drawText("GeoProof Camera", titleX, titleBaseline, titlePaint)
        } else {
            canvas.drawText("GeoProof Camera", textStartX, titleBaseline, titlePaint)
        }

        val verifiedX = cardX + cardW - cardPadRight
        canvas.drawText("✓ Verified", verifiedX, titleBaseline, verifiedPaint)

        currentY += headerH

        // 2. City & Address
        if (settings.showAddress && address != null) {
            currentY += sectionSpacing
            val cityY = currentY + cityPaint.textSize
            canvas.drawText(cityText, textStartX, cityY, cityPaint)
            currentY += cityPaint.textSize

            for (line in subLines) {
                currentY += rowSpacing
                val subY = currentY + subPaint.textSize
                canvas.drawText(line, textStartX, subY, subPaint)
                currentY += subPaint.textSize
            }
        }

        // 3. Coordinates
        if (settings.showCoordinates) {
            currentY += sectionSpacing
            val coordY = currentY + coordPaint.textSize
            canvas.drawText(coordText, textStartX, coordY, coordPaint)
            currentY += coordPaint.textSize
        }

        // 4. Date & Time
        if (settings.showDate || settings.showTime) {
            currentY += sectionSpacing
            val dtY = currentY + dateTimePaint.textSize
            canvas.drawText(dtText, textStartX, dtY, dateTimePaint)
            currentY += dateTimePaint.textSize
        }

        // 5. Weather
        if (settings.showWeather && weather != null) {
            currentY += sectionSpacing
            val weatherY = currentY + weatherPaint.textSize
            canvas.drawText(weatherText, textStartX, weatherY, weatherPaint)
        }

        return result
    }

    // ─── Drawing helpers ──────────────────────────────────────────────────────

    private fun drawRoundedBitmap(canvas: Canvas, src: Bitmap, dst: RectF, r: Float) {
        val scaled = Bitmap.createScaledBitmap(src, dst.width().toInt(), dst.height().toInt(), true)
        val path = Path().apply { addRoundRect(dst, r, r, Path.Direction.CW) }
        canvas.save(); canvas.clipPath(path)
        canvas.drawBitmap(scaled, null, dst, null)
        canvas.restore(); scaled.recycle()
    }

    private fun autoShrink(p: Paint, text: String, maxW: Float, min: Float) {
        while (p.measureText(text) > maxW && p.textSize > min) p.textSize -= 1f
    }

    // ─── Text builders ────────────────────────────────────────────────────────

    private fun buildCity(a: Address): String {
        val city = a.locality ?: a.subAdminArea ?: a.adminArea ?: ""
        val state = a.adminArea ?: ""
        val country = a.countryName ?: ""
        return buildString {
            if (city.isNotBlank()) append(city)
            if (state.isNotBlank() && state != city) { if (isNotEmpty()) append(", "); append(state) }
            if (country.isNotBlank()) { if (isNotEmpty()) append(", "); append(country) }
        }.ifBlank { "Unknown Location" }
    }

    private fun buildSub(a: Address): String {
        val parts = listOfNotNull(
            a.subLocality?.takeIf { it.isNotBlank() },
            a.thoroughfare?.takeIf { it.isNotBlank() },
            a.subAdminArea?.takeIf { it.isNotBlank() },
            buildString { if (!a.postalCode.isNullOrBlank()) append(a.postalCode) }.takeIf { it.isNotBlank() }
        ).distinct()
        return parts.take(3).joinToString(", ")
    }

    private fun buildDateTime(location: Location): String {
        val ms  = if (location.time > 0) location.time else System.currentTimeMillis()
        val tz  = TimeZone.getDefault()
        val dateFmt = SimpleDateFormat(settings.dateFormat, Locale.getDefault()).apply { timeZone = tz }
        val timeFmt = SimpleDateFormat(
            if (settings.timeFormat == SettingsManager.TIME_12H) "hh:mm a" else "HH:mm",
            Locale.getDefault()
        ).apply { timeZone = tz }
        val off = tz.getOffset(ms)
        val sign = if (off >= 0) "+" else "-"
        val h = Math.abs(off) / 3_600_000
        val m = (Math.abs(off) % 3_600_000) / 60_000
        val gmt = "GMT $sign%02d:%02d".format(h, m)

        return buildString {
            if (settings.showDate) append(dateFmt.format(Date(ms)))
            if (settings.showDate && settings.showTime) append("   ")
            if (settings.showTime) append("${timeFmt.format(Date(ms))}  $gmt")
        }
    }

    private fun flagEmoji(code: String): String {
        if (code.length != 2) return ""
        return try {
            val u = code.uppercase()
            String(Character.toChars(u[0].code - 'A'.code + 0x1F1E6)) +
                    String(Character.toChars(u[1].code - 'A'.code + 0x1F1E6))
        } catch (e: Exception) { "" }
    }

    private fun wrapText(text: String, paint: Paint, maxW: Float): List<String> {
        val words = text.split(" "); val lines = mutableListOf<String>(); var cur = ""
        for (w in words) {
            val test = if (cur.isEmpty()) w else "$cur $w"
            cur = if (paint.measureText(test) <= maxW) test else { lines += cur; w }
        }
        if (cur.isNotEmpty()) lines += cur
        return lines.take(2)
    }
}
