/**
 * Convert NSArray into JS array
 */
export function toArray(object) {
  const arr = []
  if (Array.isArray(object)) {
    return object
  }
  for (let j = 0; j < (object || []).length; j += 1) {
    arr.push(object[j])
  }
  return arr
}

/**
 * Make synchronous HTTP request and return minimal, easy-to-use response object
 * with response body and statusCode
 */
export function request(url) {
  const nsUrl = NSURL.URLWithString(url)
  if (!nsUrl) {
    throw new Error(`Invalid URL: ${url}`)
  }
  const req = NSURLRequest.requestWithURL(nsUrl)
  const responsePtr = MOPointer.alloc().init()
  const body = NSURLConnection.sendSynchronousRequest_returningResponse_error(
    req,
    responsePtr,
    null
  )
  const statusCode = responsePtr.value().statusCode()
  return {
    body,
    statusCode,
    isSuccess: statusCode >= 200 && statusCode <= 299,
  }
}

/**
 * Verify user has selected a valid shape and returns its frame.
 */
export function selectedShape(selection) {
  const selectionArray = toArray(selection)
  if (selectionArray.length !== 1) {
    return null
  }
  const firstSelectedShape = selectionArray[0]
  if (!firstSelectedShape.isKindOfClass(MSRectangleShape)) {
    return null
  }
  return firstSelectedShape
}

/**
 * Creates an NSAlert dialog containing an NSComboBox with the
 * given options.
 */
export function alertWithOptions(
  options = [],
  { title = 'Please choose an option', selectedIndex = 0 } = {}
) {
  const accessory = NSComboBox.alloc().initWithFrame(NSMakeRect(0, 0, 200, 25))
  accessory.addItemsWithObjectValues(options)
  accessory.selectItemAtIndex(selectedIndex)

  const alert = NSAlert.alloc().init()
  alert.setMessageText(title)
  alert.addButtonWithTitle('OK')
  alert.addButtonWithTitle('Cancel')
  alert.setAccessoryView(accessory)

  const pressedButton = alert.runModal()
  return (
    // eslint-disable-next-line eqeqeq
    pressedButton == NSAlertFirstButtonReturn && accessory.indexOfSelectedItem()
  )
}

/**
 * Fit and center layer to frame
 */
export function fitLayerToFrame(layer, frame) {
  const layerFrame = layer.frame()
  const ratio = layerFrame.width() / layerFrame.height()
  let width = frame.width()
  let height = width / ratio
  if (height > frame.height()) {
    height = frame.height()
    width = height * ratio
  }
  // Center in selection frame
  layerFrame.setX(frame.x() + frame.width() / 2 - width / 2)
  layerFrame.setY(frame.y() + frame.height() / 2 - height / 2)
  layerFrame.setWidth(width)
  layerFrame.setHeight(height)
}
