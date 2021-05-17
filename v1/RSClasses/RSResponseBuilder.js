class RSResponseBuilder {
  constructor() {
    this.version = "1";
    this.type = "REST";
    this.endpoint = null;
    this.headers = null;
    this.method = null;
    this.params = null;
    this.JSON = null;
    this.XML = null;
    this.FORM = null;
    this.files = null;
  }

  setVersion(version) {
    this.version = version;
    return this;
  }

  setType(type) {
    this.type = type;
    return this;
  }

  setEndpoint(endpoint) {
    this.endpoint = endpoint;
    return this;
  }

  setHeaders(headers) {
    this.headers = headers;
    return this;
  }

  setMethod(method) {
    this.method = method;
    return this;
  }

  setParams(params) {
    this.params = params;
    return this;
  }

  setJSON(json) {
    this.JSON = json;
    return this;
  }

  setXML(xml) {
    this.XML = xml;
    return this;
  }

  setForm(form) {
    this.FORM = form;
    return this;
  }

  setFiles(files) {
    this.files = files;
    return this;
  }

  build() {
    let response;
    response.version = this.version;
    response.type = this.type;
    response.headers = this.headers;
    response.endpoint = this.endpoint;
    response.method = this.method;
    response.params = this.params;
    response.body.JSON = this.JSON;
    response.body.XML = this.xml;
    response.body.FORM = this.form;
    response.files = this.files;
    return response;
  }
}
module.exports = RSResponseBuilder;
