$logoDirs = @("assets\logo", "public\assets\logo")
foreach ($d in $logoDirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Path $d -Force
    }
    Copy-Item "temp_zip\sri-sai-logo.png" -Destination "$d\sri-sai-logo.png" -Force
    Copy-Item "temp_zip\app-icon-512.png" -Destination "$d\app-icon-512.png" -Force
    Copy-Item "temp_zip\app-icon-192.png" -Destination "$d\app-icon-192.png" -Force
    Copy-Item "temp_zip\apple-touch-icon-180.png" -Destination "$d\apple-touch-icon-180.png" -Force
    Copy-Item "temp_zip\favicon-48.png" -Destination "$d\favicon-48.png" -Force
    Copy-Item "temp_zip\badge-silhouette.png" -Destination "$d\badge-96.png" -Force
}

# Also update root and public PWA icons so any existing paths resolve to new Sri Sai branding
Copy-Item "temp_zip\app-icon-192.png" -Destination "icon-192.png" -Force
Copy-Item "temp_zip\app-icon-512.png" -Destination "icon-512.png" -Force
Copy-Item "temp_zip\apple-touch-icon-180.png" -Destination "apple-touch-icon.png" -Force
Copy-Item "temp_zip\favicon-48.png" -Destination "favicon-48.png" -Force

Copy-Item "temp_zip\app-icon-192.png" -Destination "public\icon-192.png" -Force
Copy-Item "temp_zip\app-icon-512.png" -Destination "public\icon-512.png" -Force
Copy-Item "temp_zip\apple-touch-icon-180.png" -Destination "public\apple-touch-icon.png" -Force
Copy-Item "temp_zip\favicon-48.png" -Destination "public\favicon-48.png" -Force

Write-Host "Logos installed successfully in all locations!"

