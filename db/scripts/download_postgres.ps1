#
# PostreSQL download
# postgresql-10.9-2-windows-x64-binaries.zip
# 
# Powershell -ExecutionPolicy ByPass -File download_postgres.ps1
#
# $postgreSQLDbPath = "$env:SystemDrive\PostreSQL" 
#
$postgreSQLDbPath = "$pwd\PostgreSQL"
$url = "http://sbp.enterprisedb.com/getfile.jsp?fileid=11764&_ga=2.156975995.1525931773.1563642173-1725520842.1561379100" 
$zipFile = "$postgreSQLDbPath\postgres.10.9.2.zip" 
$dataFolder = "$postgreSQLDbPath\data" 
$unzippedFolderContent ="$postgreSQLDbPath\postgres-win32-x64-10.9.2"
 
if ((Test-Path -path $postgreSQLDbPath) -eq $false) 
{
	Write-Host "Setting up directories..."
	$temp = md $postgreSQLDbPath 
	$temp = md $unzippedFolderContent
	$temp = md $dataFolder

	Write-Host "Downloading PostgreSQL database 10.9..."
	$webClient = New-Object System.Net.WebClient 
	$webClient.DownloadFile($url,$zipFile)

	Write-Host "Unblock zip file..."
	Get-ChildItem -Path $postgreSQLDbPath -Recurse | Unblock-File

	Write-Host "Unzipping PostgreSQL files..."
	$shellApp = New-Object -com shell.application 
	$destination = $shellApp.namespace($postgreSQLDbPath) 
	$destination.Copyhere($shellApp.namespace($zipFile).items())
	 
	Copy-Item "$unzippedFolderContent\*" $postgreSQLDbPath -recurse

	Write-Host "Cleaning up..."
	Remove-Item $unzippedFolderContent -recurse -force 
	Remove-Item $zipFile -recurse -force

	Write-Host "PostgreSQL successfully downloaded."
}
else {
	Write-Host "PostgreSQL already downloaded."
}