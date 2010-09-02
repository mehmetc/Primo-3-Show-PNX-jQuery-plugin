/* ****************************************************************************
 *
 * jQuery ShowPNX plugin for Primo v3.0
 *
 * This plugin uses the Primo Web Services to return data please make sure
 * the are not blocked or restricted by a Firewall or by Configuration
 *
 * Version: 0.2
 *
 * Libis (c) 2010 -- BSD license
 * Mehmet Celik -- mehmet.celik at libis.be
 * 
 */
var pnx_record = null;
jQuery(document).ready(function() {
    $('body').append("<div id='PNXData' style='display:none; position:absolute; top:0; bottom:0; left:0;background-color: black; color:white; height: 100%; z-index: 1000; width: 100%; overflow:auto;'><div id='PNXData_close' style='position:absolute; top:0; right:0; background-color:red; font-size=1.5em;'>CLOSE</div><div id='PNXData_body'></div></div>")
    $('#PNXData_close').click(function() {
        $('#PNXData').hide();
    });

    $('.EXLResultRecordId').each(
    function(index, element) {
        var record_id = $(this).attr('id');
	if ((record_id.substring(0, 2) != 'TN') && (record_id.substring(0, 5) != 'dedup')) { //skip PrimoCentral records and dedup records
            $(this.parentNode).append("<a class='showPNX' data-pnx='" + record_id + "' style='font-size:0.5em;'>Show PNX</a>");
            $('.showPNX').live('click',
            function() {
                var rec_id = $(this).attr('data-pnx');
                var q = 'any,contains,' + rec_id;
                var xmlpnx = $.ajax({
                    url: '/PrimoWebServices/xservice/search/brief',
                    data: {
                        institution: 'KUL',
                        query: q,
                        onCampus: 'false',
                        indx: 1,
                        bulkSize: 1,
                        dym: 'false',
                        highlight: 'false',
                        lang: 'eng'
                    },
                    async: false,
                    error: function(request, status, error) {
	// TODO: Catch empty responses due to firewall or configuration restrictions
                        alert('Ooops: ' + request.statusText + ' --> ' + request.responseText);
                    }
                }).responseXML;
                pnx_record = $(xmlpnx).find('record').eq(0);
                var strpnx = "";
                if (window.ActiveXObject) {
                    strpnx = pnx_record[0].xml;
                }
                else {
                    strpnx = (new XMLSerializer()).serializeToString(pnx_record[0]);
                }

                strpnx = strpnx.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
                $('#PNXData_body').empty().append("<pre>" + strpnx + "</pre>");
                $('#PNXData').show();
                scrollTo(0, 0);
            }
            );
        }
    }
    );
});
