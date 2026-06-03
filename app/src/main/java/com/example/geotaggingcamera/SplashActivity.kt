package com.example.geotaggingcamera

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.animation.AnimationUtils
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class SplashActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        // Animate logo and tagline in
        val logo    = findViewById<ImageView>(R.id.ivSplashLogo)
        val title   = findViewById<TextView>(R.id.tvSplashTitle)
        val tagline = findViewById<TextView>(R.id.tvSplashTagline)
        val version = findViewById<TextView>(R.id.tvSplashVersion)

        val fadeIn  = AnimationUtils.loadAnimation(this, android.R.anim.fade_in)
        val slideUp = AnimationUtils.loadAnimation(this, R.anim.slide_up_fade_in)

        logo.startAnimation(fadeIn)
        title.startAnimation(slideUp)
        tagline.startAnimation(slideUp)
        version.startAnimation(fadeIn)

        // Navigate to camera after 2 seconds
        Handler(Looper.getMainLooper()).postDelayed({
            startActivity(Intent(this, MainActivity::class.java))
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            finish()
        }, 2000)
    }
}
