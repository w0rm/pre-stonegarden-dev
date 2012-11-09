
var login = function() { 
    var bg = $( "<div/>" )
        .css({
            position: "fixed",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            background: "#eee",
            opacity: 0
        })
        .appendTo( "body" )
        .animate({ opacity: 0.7 });
    
    $.get( "/login", function( data ) {
        var close_login = function( e ) {
                e.preventDefault();
                bg.add( container )
                    .animate({ opacity: 0 }, function() { $( this ).remove(); });
            },
            container = $( "<div/>" )
                .css({
                    position: "fixed",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%"
                })
                .append( $( data ).click(function( e ){ e.stopPropagation(); }) )
                .appendTo( "body" )
                .click( close_login );
        container.find( ".ui-dialog-titlebar-close" )
            .click( close_login );
    });
    
};
