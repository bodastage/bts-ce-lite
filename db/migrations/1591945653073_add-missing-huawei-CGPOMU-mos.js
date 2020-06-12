exports.shorthands = undefined;

exports.up = (pgm) => {
	pgm.noTransaction();
	pgm.createTable({schema: "huawei_cm", name: "CGPOMUIPADDR"}, {id: "id", load_datetime: "load_datetime", data:
	"data"});
	pgm.createTable({schema: "huawei_cm", name: "CGPOMUMEMBER"}, {id: "id", load_datetime: "load_datetime", data: "data"});	
	pgm.createTable({schema: "huawei_cm", name: "CGPOMUTIMEZONE"}, {id: "id", load_datetime: "load_datetime", data: "data"});	
	pgm.createTable({schema: "huawei_cm", name: "NETWORKELEMENT"}, {id: "id", load_datetime: "load_datetime", data: "data"});	
	pgm.createTable({schema: "huawei_cm", name: "ULGROUP"}, {id: "id", load_datetime: "load_datetime", data: "data"});	
};

exports.down = (pgm) => {
	pgm.dropTable({schema: "huawei_cm", name: 'CGPOMUIPADDR'});
	pgm.dropTable({schema: "huawei_cm", name: 'CGPOMUTIMEZONE'});
	pgm.dropTable({schema: "huawei_cm", name: 'NETWORKELEMENT'});
	pgm.dropTable({schema: "huawei_cm", name: 'ULGROUP'});
};
