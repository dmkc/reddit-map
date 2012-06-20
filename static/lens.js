$(function(){
    // Create map panel
    var map          = $(document.createElement('div')).prop('id', 'reddit-map'),
        content      = $(document.createElement('div')).addClass('reddit-map-content'),
        lens         = $( document.createElement('div')).addClass('reddit-map-lens'),
        height_ratio = 0,
        
   // Comment DOM nodes
        reddit_content = $('.commentarea').children('.sitetable')
        reddit_comments = reddit_content.children('.comment'),
        init_map = function() { 
            // Lens dragging behaviour
            lens.draggable({ axis: 'y' });
            resize_lens();

            $(document).bind( 'scroll', scroll_map );

            lens.bind( 'drag', function(e,ui) {
                // drop the scroll handler or it'll mess up our scrolling
                //$(document).unbind( 'scroll', scroll_map );
                //lens_move_handler( e, ui )
            });

            lens.bind( 'dragstop', function(e,ui) {
                // drop the scroll handler or it'll mess up our scrolling
                //$(document).bind( 'scroll', scroll_map );
                lens_move_handler( e, ui )
            });
        },
        comment_tree = function( parent, nodes ) {
            $.each( nodes, function(){//{{{
                var $n = $(this),
                    comment_children = $n.children('.child').children('.sitetable').children('.comment'),
                    comment  = $(document.createElement('div')).addClass('reddit-map-comment'),
                    node     = $( document.createElement('div')).addClass('reddit-map-comment-node'), 
                    children = $( document.createElement('div')).addClass('reddit-map-comment-children');

                comment.append( node ).append( children );
                // keep track of the original DOM node for the comment
                comment.data( 'orig', this );

                parent.append( comment );

                // recurse on the comment's children
                if( comment_children.length != 0 ) {
                    comment_tree( children, comment_children );
                }//}}}
            });
        },

        // Scroll map proportionally to the document
        scroll_map = function() {
            var offset = ( window.pageYOffset  ) * height_ratio;

            if ( offset + $(window).height() <= content.height() ) {
                content.css( 'margin-top', -offset + 15 );
            }
            resize_lens();
        }
        
        // Scroll document if user moves lens
        lens_move_handler = function( e, ui ) {
            $('html,body').animate( { 
                scrollTop: ( window.pageYOffset * height_ratio + ui.position.top ) / height_ratio },
            300);
            lens.animate( { top: 0 }, 300 );
        },

        // Resize lens based on window height
        resize_lens = function(e){
            lens.height( $(window).height() * height_ratio );
        };

    map.append( lens, content );
    map.insertBefore( $(document.body).children().eq(0));
    comment_tree( content, reddit_comments );

    height_ratio = content.height() / $(document).height();

    // Vroom!
    init_map();

});
