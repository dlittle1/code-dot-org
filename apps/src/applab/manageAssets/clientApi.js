module.exports = {
  basePath: '/v3/assets/' + dashboard.project.current.id,
  ajax: function (method, file, success, error, data) {
    var url = this.basePath;
    if (file) {
      url += '/' + file;
    }
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function () {
      if (xhr.status >= 400) {
        error(xhr);
        return;
      }
      success(xhr);
    });
    xhr.addEventListener('error', function () {
      error(xhr);
    });

    xhr.open(method, url, true);
    xhr.send(data);
  }
};
