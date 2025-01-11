import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FinancialTable from './component/FinancialTable'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <FinancialTable />
      </div>
    </>
  )
}

export default App
