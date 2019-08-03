import numeral from 'numeral'
export default (value) => {
  return numeral(numeral(value).format('0.00')).value()
}