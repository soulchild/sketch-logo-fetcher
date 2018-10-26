import { selectedShape, request } from './lib/helpers'

export default function(context) {
  const { document, selection } = context

  function fetchLogo(companyUrl, destinationShape) {
    const { body, isSuccess } = request(
      `https://logo.clearbit.com/${companyUrl}`
    )
    if (!isSuccess) {
      document.showMessage(`No logo found for URL "${companyUrl}"`)
      return
    }

    // Fill shape with logo
    const logoImage = NSImage.alloc().initWithData(body)
    const logoImageData = MSImageData.alloc().initWithImage(logoImage)
    const fill = destinationShape
      .style()
      .fills()
      .firstObject()
    fill.setFillType(4) // 4 = Pattern - see: http://developer.sketchapp.com/reference/MSStyleFill/
    fill.setPatternFillType(1)
    fill.setIsEnabled(true)
    fill.setImage(logoImageData)
  }

  function askForCompanyUrl() {
    return document.askForUserInput_initialValue(
      'Enter URL of company website (e.g. www.google.com):',
      ''
    )
  }

  const destinationShape = selectedShape(selection)
  if (!destinationShape) {
    document.showMessage('Please select a layer with a single rectangle shape')
    return
  }

  const companyUrl = askForCompanyUrl()
  if (companyUrl) {
    fetchLogo(companyUrl, destinationShape)
  }
}
