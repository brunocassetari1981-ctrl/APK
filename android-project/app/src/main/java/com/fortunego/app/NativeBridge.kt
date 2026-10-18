package com.fortunego.app

import android.content.Context
import android.os.Vibrator
import android.webkit.JavascriptInterface
import android.widget.Toast

class NativeBridge(private val context: Context) {
    @JavascriptInterface
    fun vibrate(durationMs: Long) {
        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        vibrator?.vibrate(durationMs)
    }

    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }
}
