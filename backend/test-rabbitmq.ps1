param(
    [string]$BaseUrl = 'http://localhost:3000',
    [int]$ProductId = 1,
    [int]$Quantity = 1
)

function Invoke-Api {
    param(
        [string]$Path,
        [string]$Method = 'GET',
        [hashtable]$Body = $null,
        [string]$Token = $null
    )

    $headers = @{
        'Content-Type' = 'application/json'
    }

    if ($Token) {
        $headers['Authorization'] = "Bearer $Token"
    }

    $options = [ordered]@{
        Uri = "$BaseUrl$Path"
        Method = $Method
        Headers = $headers
        ErrorAction = 'Stop'
    }

    if ($Body) {
        $options.Body = $Body | ConvertTo-Json -Depth 5
    }

    return Invoke-RestMethod @options
}

function Login {
    param(
        [string]$Email,
        [string]$Password
    )

    Write-Host "Logging in as $Email..."

    try {
        $result = Invoke-Api -Path '/login' -Method 'POST' -Body @{ email = $Email; password = $Password }
        return $result.token
    } catch {
        # FIXED: Use $($Email) to properly evaluate the variable
        Write-Error "Login failed for $($Email): $_"
        throw
    }
}

try {
    Write-Host '--- RabbitMQ manager/user test started ---' -ForegroundColor Cyan

    $staffToken = Login -Email 'staff@example.com' -Password 'password123'
    $managerToken = Login -Email 'manager@example.com' -Password 'password123'
    $userToken = Login -Email 'user@example.com' -Password 'password123'

    Write-Host "Producing stock event as staff user..."
    $stockResponse = Invoke-Api -Path '/inventory/stock-in' -Method 'POST' -Body @{ productId = $ProductId; quantity = $Quantity } -Token $staffToken
    Write-Host 'Stock event produced:'
    $stockResponse | Format-List

    Write-Host "Pulling queue as manager..."
    $stockUpdate = Invoke-Api -Path '/stock-updates' -Method 'GET' -Token $managerToken

    if (-not $stockUpdate) {
        Write-Warning 'No RabbitMQ message was returned from /stock-updates.'
    } else {
        Write-Host 'Manager received RabbitMQ event:' -ForegroundColor Green
        $stockUpdate | ConvertTo-Json -Depth 5 | Write-Host

        if ($stockUpdate.userNotifications) {
            Write-Host "Users notified count: $($stockUpdate.userNotifications.Count)"
            $notificationEmails = $stockUpdate.userNotifications | ForEach-Object { $_.userEmail }
            if ($notificationEmails -contains 'user@example.com') {
                Write-Host 'Regular user user@example.com is included in the notification list.' -ForegroundColor Green
            } else {
                Write-Warning 'Regular user user@example.com was not found in the notification list.'
            }
        }
    }

    Write-Host 'Verifying regular user can still login and purchase:' -ForegroundColor Cyan
    $userProductList = Invoke-Api -Path '/products' -Method 'GET' -Token $userToken
    Write-Host "Products available: $($userProductList.Count)"

    Write-Host '--- RabbitMQ manager/user test completed ---' -ForegroundColor Cyan
} catch {
    Write-Error "Test failed: $_"
    exit 1
}