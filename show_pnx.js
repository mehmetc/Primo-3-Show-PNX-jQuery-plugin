/* ****************************************************************************
 *
 * jQuery ShowPNX plugin for Primo v3.0
 *
 * This plugin uses the Primo Web Services to return data please make sure
 * they are not blocked or restricted by a Firewall or by Configuration.
 * Rule of thumb: If the PRIMO API works this script works
 *
 * !!!!!!!!!!!! update the 'defaultInstitutioncode' variable !!!!!!!!!!!!!!!
 *
 * Version: 0.3
 *
 * Libis (c) 2010 - 2012
 * Mehmet Celik
 * 
 */
var pnxRecord = null;
var defaultInstitutionCode = 'KUL'; // <--- UPDATE this when used locally

function loadPNXRecord(recordId, institutionCode) {
	var result = "";
    var search = "local";
	
	if (typeof institutionCode == 'undefined') {
	  institutionCode = defaultInstitutionCode;
	}

    //search local or remote
    if ((recordId.substring(0, 2) == 'TN')) {
        search = "adaptor,primo_central_multiple_fe";
        recordId = recordId.substring(3);
    }


    var q = 'any,contains,' + recordId;
    var xmlpnx = $.ajax({
        url: '/PrimoWebServices/xservice/search/brief',
        dataType: 'xml',
        data: {
            institution: institutionCode,
            query: q,
            onCampus: 'false',
            indx: 1,
            bulkSize: 1,
            dym: 'false',
            highlight: 'false',
            lang: 'eng',
            loc: search
        },
        async: false,
        error: function(request, status, error) {
            // TODO: Catch empty responses due to firewall or configuration restrictions
            alert('Ooops: ' + request.statusText + ' --> ' + request.responseText);
        }
    }).responseXML;
    
    pnxRecord = $(xmlpnx).find('record').eq(0);

    //PRIMO CENTRAL records have a namespace prefix. Local PNX records don't
    if (pnx_record.size() == 0){
        pnx_record = $(xmlpnx).find('[nodeName="prim:record"]').eq(0);      
        if(pnx_record.size() == 0) { //some jQuery versions refuse the above query
           pnx_record = $(xmlpnx).find('prim\\:record').eq(0);      
        }
    }

    if (pnxRecord.size() > 0) {
        if (window.ActiveXObject) {
            result = pnxRecord[0].xml;
        }
        else {
            result = (new XMLSerializer()).serializeToString(pnxRecord[0]);
        }

        result = result.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
    } else {
        result = "No data loaded";
    }

	return result;
}

jQuery(document).ready(function() {	
	//Setup container for PNX record
    jQuery('body').append("<div id='PNXData' style='display:none; position:absolute; top:0; bottom:0; left:0;background-color: black; color:white; height: 100%; z-index: 1000; width: 100%; overflow:auto;'><div id='PNXData_close' style='position:absolute; top:0; right:0; background-color:red; font-size=1.5em;'>CLOSE</div><div id='PNXData_body'></div></div>");
    jQuery('#PNXData_close').click(function() {
        jQuery('#PNXData').hide();
    });

	// Add Show PNX link
    jQuery('.EXLResultRecordId').each(
	    function(index, element) {
	        var record_id = $(this).attr('id');

	        if ((record_id.substring(0, 5) != 'dedup')) {
	            //skip dedup records
				var labelName = 'showPnx' + index;
	            jQuery(this.parentNode).append("<a id='" + labelName + "' data-pnx='" + record_id + "' style='font-size:0.5em;'>Show PNX</a>");
	            jQuery('#' + labelName).click(
	            function() {
	                var recordId = $(this).attr('data-pnx');

	                jQuery('#PNXData_body').empty().append("<pre>" + loadPNXRecord(recordId) + "</pre>");
	                jQuery('#PNXData').show();
	                scrollTo(0, 0);
	            }
	            );
	        }
	    }
    );
});
