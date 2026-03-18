## ADDED Requirements

### Requirement: 系統 SHALL 在首次編輯儲存格時記錄其原始值
當使用者首次透過 Edit Modal 儲存某個儲存格的新值時，系統 SHALL 將該儲存格編輯前的值記錄至 `state.editedCells` Map 中（key 為 `key::lang`，value 為原始值）。若該儲存格已有記錄（已被編輯過），SHALL NOT 覆蓋原始值。

#### Scenario: 首次編輯儲存格記錄原始值
- **WHEN** 使用者透過 Edit Modal 儲存一個從未被手動編輯過的儲存格
- **THEN** 系統 SHALL 將編輯前的值存入 `state.editedCells` Map，key 為 `key::lang`

#### Scenario: 重複編輯不覆蓋原始值
- **WHEN** 使用者再次編輯一個已被手動編輯過的儲存格（`editedCells` 中已有記錄）
- **THEN** 系統 SHALL NOT 更新 `editedCells` 中該 key 的值（保留首次編輯前的原始值）

### Requirement: Edit Modal SHALL 提供復原按鈕
編輯對話框 SHALL 包含一個「復原」按鈕，讓使用者可將儲存格值恢復至首次編輯前的原始值。

#### Scenario: 已編輯儲存格顯示可用的復原按鈕
- **WHEN** Edit Modal 開啟且該儲存格在 `editedCells` Map 中有記錄
- **THEN** 復原按鈕 SHALL 為啟用狀態（非 disabled）

#### Scenario: 未編輯儲存格顯示停用的復原按鈕
- **WHEN** Edit Modal 開啟且該儲存格在 `editedCells` Map 中無記錄
- **THEN** 復原按鈕 SHALL 為停用狀態（disabled）

#### Scenario: 點擊復原按鈕恢復原始值
- **WHEN** 使用者在 Edit Modal 中點擊復原按鈕
- **THEN** 系統 SHALL 將 `state.jsonData[lang][key]` 恢復為 `editedCells` 中記錄的原始值
- **AND** SHALL 從 `editedCells` Map 中移除該 key 的記錄
- **AND** SHALL 重新渲染表格
- **AND** SHALL 關閉 Edit Modal
- **AND** SHALL 顯示成功 toast 訊息

#### Scenario: 復原後再次編輯重新記錄原始值
- **WHEN** 使用者對某儲存格執行復原操作後，再次編輯該儲存格
- **THEN** 系統 SHALL 以復原後的值（即原始值）作為新的原始值記錄至 `editedCells`
