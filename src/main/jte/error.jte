@param Integer status
@param String error
@param String message

@template.Index(content = @`
    <h2>HTTP ${status} - ${error}</h2>
    <p>${message}</p>
`)