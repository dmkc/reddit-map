$(function(){
    // Lens!
    var lens = $(document.createElement('div')).prop('id', 'reddit-lens'),
        top_level_comments = $('.commentarea').children('.sitetable').children('.comment'),
        parse_comments = function( parent, nodes ) {
            $.each( nodes, function(){
                var that = $( this ),
                    comment = $(document.createElement('div')).addClass('lens-comment'),
                    node = $( document.createElement('div')).addClass('lens-comment-node'), 
                    children = $( document.createElement('div')).addClass('lens-comment-children');

                comment.append( node ).append( children );
                parent.append( comment );

                // recurse on the comment's children
                if( that.children().length !== 0 ) {
                    parse_comments( children, that.children() );
                }
            });
        };

    lens.insertBefore( $(document.body).children().eq(0));
    parse_comments( lens, top_level_comments );

});
