import React, { Suspense, lazy } from "react"
import ReactDOM from "react-dom/client"
import "./index.css"

// Динамическая загрузка удаленного компонента
const RemoteHelpWidget = lazy(() => import("pomoshchnik/HelpWidget"))

function HostApp() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Host Application</h1>
      <p>Это пример приложения-хоста, которое загружает виджет помощника через Module Federation</p>

      <div style={{ marginTop: "40px", padding: "20px", border: "2px dashed #ccc" }}>
        <h2>Область демо:</h2>
        <p>Виджет помощника загружается из удаленного приложения</p>

        <Suspense fallback={<div>Загрузка виджета...</div>}>
          <RemoteHelpWidget />
        </Suspense>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HostApp />
  </React.StrictMode>,
)
