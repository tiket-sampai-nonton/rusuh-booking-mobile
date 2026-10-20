pluginManagement {
    resolutionStrategy {
        eachPlugin {
            if (requested.id.id == "com.android.kotlin.multiplatform.library") {
                useModule("com.android.tools.build:gradle:${requested.version}")
            }
        }
    }
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_PROJECT)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "rusuh-booking"
include(":shared", ":androidApp", ":webApp")
