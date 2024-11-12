
interface props {
  radius?: string
}
  
function Spinner({ radius = '50px' }: props) {
  return (
    <span
      style={{ width: radius, height: radius }}
      className='spinner'
    >
    </span>
  )
}

export default Spinner
  