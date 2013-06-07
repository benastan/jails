var AjaxDataSource = function() { this.request.apply(this, arguments); };
AjaxDataSource.request = function() { $.ajax.apply($, arguments); };
Jails.dataSource = Jails.dataSource || AjaxDataSource;
