$(function(){
    // Lens panel
    var lens = $(document.createElement('div')).prop('id', 'reddit-lens'),
        content = $(document.createElement('div')).addClass('lens-content'),
        height_ratio = 0,
        
   // Comment DOM nodes
        top_level_comments = $('.commentarea').children('.sitetable').children('.comment'),
        parse_comments = function( parent, nodes ) {
            $.each( nodes, function(){
                var $n = $(this),
                    comment_children = $n.children('.child').children('.sitetable').children('.comment'),
                    comment  = $(document.createElement('div')).addClass('lens-comment'),
                    node     = $( document.createElement('div')).addClass('lens-comment-node'), 
                    children = $( document.createElement('div')).addClass('lens-comment-children');

                comment.append( node ).append( children );
                // keep track of the original DOM node for the comment
                comment.data( 'orig', this );

                parent.append( comment );

                // recurse on the comment's children
                if( comment_children.length != 0 ) {
                    parse_comments( children, comment_children );
                }
            });
        };

    lens.append( content );
    lens.insertBefore( $(document.body).children().eq(0));
    parse_comments( content, top_level_comments );

    height_ratio = content.height() / $(document).height();

    // Scroll lens proportionally with viewport
    $(document).scroll( function() {
        var offset = ( window.pageYOffset + $(window).height()/2 ) * height_ratio;

        if ( offset + $(window).height() <= content.height() ) {
            content.css( 'margin-top', -offset + 15 );
        }
    });
});
