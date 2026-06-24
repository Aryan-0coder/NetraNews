try {
  Write-Output 'EN summary:'
  $b='{"articleId":"6a38523a484e096686507523","language":"en"}'
  $res = Invoke-RestMethod -Uri 'http://localhost:8080/api/ai/summarize' -Method Post -Body $b -ContentType 'application/json'
  $res | ConvertTo-Json | Write-Output
} catch { Write-Output "EN summary error: $_" }

try {
  Write-Output 'HI summary (articleId, language hi):'
  $b='{"articleId":"6a38523a484e096686507523","language":"hi"}'
  $res = Invoke-RestMethod -Uri 'http://localhost:8080/api/ai/summarize' -Method Post -Body $b -ContentType 'application/json'
  $res | ConvertTo-Json | Write-Output
} catch { Write-Output "HI summary error: $_" }

try {
  Write-Output 'EN chat:'
  $b='{"message":"Tell me about latest sports news","language":"en"}'
  $res = Invoke-RestMethod -Uri 'http://localhost:8080/api/ai/chat' -Method Post -Body $b -ContentType 'application/json'
  $res | ConvertTo-Json | Write-Output
} catch { Write-Output "EN chat error: $_" }

try {
  Write-Output 'HI chat (language hi):'
  $b='{"message":"Tell me about latest sports news","language":"hi"}'
  $res = Invoke-RestMethod -Uri 'http://localhost:8080/api/ai/chat' -Method Post -Body $b -ContentType 'application/json'
  $res | ConvertTo-Json | Write-Output
} catch { Write-Output "HI chat error: $_" }
