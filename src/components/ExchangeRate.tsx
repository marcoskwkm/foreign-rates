import { Rate } from '../types'

interface Props {
  rate: Rate
}

const ExchangeRate: React.FC<Props> = (props) => (
  <div className="flex w-[16rem] flex-nowrap justify-between rounded-md border-2 border-blue-800 p-2 text-xl">
    <span>1 {props.rate.source.toLocaleUpperCase()}</span>
    <span>{'->'}</span>
    <span>
      {props.rate.value} {props.rate.target.toLocaleUpperCase()}
    </span>
  </div>
)

export default ExchangeRate
