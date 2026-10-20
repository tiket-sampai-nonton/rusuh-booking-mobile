plugins {
    alias(libs.plugins.kotlin.multiplatform)
    alias(libs.plugins.android.multiplatform.library)
    alias(libs.plugins.compose.multiplatform)
    alias(libs.plugins.compose.compiler)
}

kotlin {
    androidLibrary {
        namespace = "com.tiketsampainonton.rusuhbooking.shared"
        compileSdk = 36
        minSdk = 24
    }
    listOf(iosArm64(), iosSimulatorArm64()).forEach { target ->
        target.binaries.framework {
            baseName = "Shared"
            isStatic = true
        }
    }
    // Node is a test runner only; the application web entry point remains browser-based.
    js { browser(); nodejs() }

    sourceSets {
        androidMain.dependencies { implementation(libs.androidx.activity.compose) }
        commonTest.dependencies { implementation(kotlin("test")) }
        commonMain.dependencies {
            implementation(compose.runtime)
            implementation(compose.foundation)
            implementation(compose.material3)
            implementation(compose.ui)
            implementation(compose.components.resources)
        }
    }
}

compose.resources {
    packageOfResClass = "com.tiketsampainonton.rusuhbooking.resources"
}
