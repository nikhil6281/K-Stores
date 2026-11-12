# Capacitor Bridge keep rules for R8/ProGuard
-keep @com.getcapacitor.NativePlugin class * { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keep class com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod public *;
}

# Preserve JS interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
