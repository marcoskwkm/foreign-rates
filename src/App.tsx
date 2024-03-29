import { pluck, zip } from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'

import ExchangeRate from './components/ExchangeRate'
import { Rate } from './types'

const ONE_MINUTE_MS = 60 * 1000

const callWithRetry = async <T extends unknown>(
  f: () => Promise<T>,
  retries: number = 3
): Promise<T> => {
  try {
    return await f()
  } catch (err) {
    if (retries > 0) {
      await new Promise((res) => setTimeout(res, 500))
      return callWithRetry(f, retries - 1)
    }
    throw err
  }
}

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
  const [error, setError] = useState<boolean>(false)

  const updateRates = useCallback(() => {
    Promise.all(
      convs.map(([from, to]) =>
        callWithRetry(() =>
          fetch(
            `https://get-rates-oirvexovfa-rj.a.run.app?from=${from}&to=${to}`
          )
        )
          .then((res) => {
            setError(false)
            return res.json()
          })
          .catch(() => {
            setError(true)
          })
      )
    ).then((rates) => {
      setLastUpdated(Math.min(...pluck('time', rates)))
      setRates(rates)
    })
  }, [convs])

  useEffect(() => {
    updateRates()
    const interval = setInterval(updateRates, ONE_MINUTE_MS)
    return () => clearInterval(interval)
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
      ) : error ? (
        <>
          <div>The application API seems to be down =(</div>
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
            {lastUpdated
              ? new Date(lastUpdated).toLocaleTimeString('pt-BR', {
                  year: '2-digit',
                  month: '2-digit',
                  day: '2-digit',
                })
              : '--/--/-- --:--:--'}
          </div>
        </>
      )}
    </div>
  )
}
export default App
