import {
  alertWithOptions,
  selectedShape,
  fitLayerToFrame,
  request,
} from './lib/helpers'

const LOGOS_API_BASE_URL = 'https://logos-api.funkreich.de/'

export default function(context) {
  const { document, selection } = context

  /**
   * Search logos for given query string
   */
  function searchLogos(query) {
    try {
      const queryUrl = `${LOGOS_API_BASE_URL}?q=${query}`
      const { body } = request(queryUrl)
      if (!body) {
        throw new Error('No response')
      }
      const decodedBody = NSString.alloc().initWithData_encoding(
        body,
        NSUTF8StringEncoding
      )
      const json = JSON.parse(decodedBody)
      if (json.error) {
        document.showMessage(json.error)
        return []
      }
      if (json.length === 0) {
        document.showMessage('No logos matching your query found')
        return []
      }
      return json
    } catch (err) {
      document.showMessage(
        `Unable to parse response from Logos API (Error was: ${err.message})`
      )
    }

    return []
  }

  function selectLogo(logos = []) {
    const options = logos.map(logo => `${logo.name} (${logo.source})`)
    const choice = alertWithOptions(options, {
      title: `${options.length} logo(s) found:`,
    })
    return choice !== undefined && logos[choice]
  }

  /**
   * Places logo from given url on the canvas
   */
  function placeLogo(url, destinationShape, options) {
    const { isSuccess, body } = request(url)
    if (!isSuccess) {
      document.showMessage(`Failed to fetch logo from API (${url})`)
      return
    }

    // Import SVG
    const selectedFrame = destinationShape.frame()
    const svgImporter = MSSVGImporter.svgImporter()
    svgImporter.prepareToImportFromData(body)
    const importedSVGLayer = svgImporter.importAsLayer()
    importedSVGLayer.name = options.name

    // Scale SVG to selected frame
    fitLayerToFrame(importedSVGLayer, selectedFrame)

    // Add label layer
    const page = document.currentPage()
    const canvas = page.currentArtboard() || page
    canvas.addLayers([importedSVGLayer])

    // Remove selection frame
    destinationShape.removeFromParent()
  }

  /**
   * Queries the user for a logo search string.
   */
  function askForLogo() {
    return document.askForUserInput_initialValue(
      'Enter logo to search for (e.g. google):',
      ''
    )
  }

  const destinationShape = selectedShape(selection)
  if (!destinationShape) {
    document.showMessage(
      'Please select a layer with a single shape (Rectangle, Oval, etc.)'
    )
    return
  }
  const query = askForLogo()
  if (query) {
    const logos = searchLogos(query)
    if (logos.length > 0) {
      const logo = selectLogo(logos)
      if (logo) {
        placeLogo(logo.logoURL, destinationShape, {
          name: `[Logo] ${logo.name}`,
        })
      }
    }
  }
}
