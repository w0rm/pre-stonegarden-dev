
$( "#page_id" )
    .change( function(){
        $.get( "/a/pages/" + $(this).val() + ".json", function( data ){
            $( "#page_path" ).text( data.path == "/" ? "/" : data.path + "/" );
        });
    });