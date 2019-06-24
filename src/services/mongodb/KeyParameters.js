export const HUAWEI_2G_KEY_PARAMAETERS = `
db.huawei_cm_gcell.aggregate(
	[
		{
			$lookup: {
				from: "huawei_cm_sys",
				localField: "FILENAME",
				foreignField: "FILENAME",
				as: "sys"
			}
		},
		{$unwind: "$sys"},
		{
			$lookup: {
				from: "huawei_cm_bts",
				let: { "bts_id": "$BTSID", "file_name": "$FILENAME"},
				pipeline: [
					{
						$match: 
						{
							$expr:{
								$and: [
									{$eq: ["$$file_name", "$FILENAME"]},
									{$eq: ["$$bts_id", "$BTSID"]}
								]
							}
						}
						
					}
				],
				as: "bts"
			}
		},
		{$unwind: "$bts"},
		{
			$project: {
				_id:0, 
				VENDOR: "HUAWEI",
				TECHNOLOGY: "2G",
				DATETIME: 1, 
				CELLNAME:1, 
				ACTSTATUS:1, 
				ADMSTAT:1, 
				MCC:1, 
				MNC:1, 
				LAC:1, 
				CI:1, 
				BCCHNO:1, 
				NCC:1, 
				BCC:1,
				BSIC: {$concat: [ {$toString:"$NCC"},{$toString: "$BCC"}] },
				CGI_RAW: {$concat: [{$toString:"$MCC"},"-", {$toString: "$MNC"}, "-", {$toString: "$LAC"}, "-", {$toString: "$CI"}]},
				CGI: {$concat: [{$toString:"$MCC"},"-", {$toString: "$MNC"}, "-", {$toString: "$LAC"}, "-", {$toString: "$CI"}]},
				SITEID: "$BTSID",
				NENAME: "$sys.SYSOBJECTID",
				SITENAME: "$bts.BTSNAME"
			}
		},
		{
			$match: { 
				$expr:{
					$and: [
						{ $eq: [{$toString: "$BCCHNO"}, "250"]},
						{ $eq: [{$toString: "$BCC"}, "6"]},
					]
				}
			}
		},
		{$limit: 100}
	]
)
`;



export const HUAWEI_3G_KEY_PARAMAETERS = `

`
