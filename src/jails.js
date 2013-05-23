(function() {
  this.Jails = Jails = this.Jails || Jails || {};
  this.Queue = Jails.Queue = Queue;
  this.Query = Jails.Query = Query;
  this.Dataset = Jails.Dataset = Dataset;
  this.Model = Jails.Model = Model;
  this.HTTPDataSource = Jails.HTTPDataSource = HTTPDataSource;
  this.Jails.data_source = typeof this.Jails.data_source !== 'undefined' ? this.Jails.data_source : AjaxDataSource;
}.apply(typeof window === 'undefined' ? module.exports : window));
