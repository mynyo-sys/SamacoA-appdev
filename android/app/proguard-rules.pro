# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.react.**
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Google Sign-In
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**
-keep class com.google.api.** { *; }
-dontwarn com.google.api.**

# Firebase
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
-keepattributes Signature
-keepattributes *Annotation*

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-dontwarn com.reactnativecommunity.asyncstorage.**

# Navigation
-keep class com.reactnavigation.** { *; }
-dontwarn com.reactnavigation.**

# Redux
-keep class com.reactredux.** { *; }
-dontwarn com.reactredux.**

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep constructors
-keepclassmembers class * {
    <init>(...);
}

# Keep getters/setters
-keepclassmembers class * {
    public void set*(***);
    public *** get*();
}
