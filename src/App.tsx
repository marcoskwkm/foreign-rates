import { pluck, zip } from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'

import ExchangeRate from './components/ExchangeRate'
import { Rate } from './types'

const App = () => {
  const convs = useMemo(
    () =>
      zip(
        new URLSearchParams(window.location.search).getAll('from'),
        new URLSearchParams(window.location.search).getAll('to')
      ),
    []
  )

  const [rates, setRates] = useState<Rate[]>([])
  const [lastUpdated, setLastUpdated] = useState<number>(0)

  const updateRates = useCallback(() => {
    Promise.all(
      convs.map(([from, to]) =>
        fetch(
          `https://get-rates-oirvexovfa-rj.a.run.app?from=${from}&to=${to}`
        ).then((res) => res.json())
      )
    ).then((rates) => {
      setLastUpdated(Math.min(...pluck('time', rates)))
      setRates(rates)
    })
  }, [convs])

  useEffect(() => {
    updateRates()
  }, [updateRates])

  return (
    <div className="h-screen overflow-y-auto bg-gray-900 p-8 text-gray-300">
      {convs.length === 0 ? (
        <>
          <div>No rates to display. Add some via query string.</div>
          <div>
            Example: {window.location.host + window.location.pathname}
            ?from=usd&to=brl
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-y-2">
            {rates.map((rate) => (
              <ExchangeRate key={rate.source + rate.target} rate={rate} />
            ))}
          </div>
          <div className="mt-2 text-sm">
            Last updated:{' '}
            {new Date(lastUpdated).toLocaleTimeString('pt-BR', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
            })}
          </div>
        </>
      )}
    </div>
  )
}
export default App
