$(function(){
    // Create map panel
    var map          = $(document.createElement('div')).prop('id', 'reddit-map'),
        content      = $(document.createElement('div')).addClass('reddit-map-content'),
        lens_wrapper = $( document.createElement('div')).addClass('reddit-map-lens-wrapper'),
        lens         = $( document.createElement('div')).addClass('reddit-map-lens'),
        height_ratio = 0,
        clicking     = false,
        dragging     = false,
        click_offset = undefined;
        
   // Comment DOM nodes
        reddit_content = $('.commentarea').children('.sitetable')
        reddit_comments = reddit_content.children('.comment'),
        init_map = function() { 
            // Lens dragging behaviour
            //lens.draggable({ axis: 'y' });
            lens.mousedown( function(e){
                clicking = true;
                click_offset = e.clientY-lens.position().top;
                
            }).mouseup( function(){
                clicking = false;
            }).mousemove( function(e){
                e.preventDefault();
                if ( !clicking ) return;

                var lens_offset   = lens.offset(),
                    lens_pos = lens.position();

                dragging = true;
                // don't let the lens move beyond screen bounds
                if ( lens_pos.top < 0 || lens_pos.top > $(window).height() )
                    return false;

                // Cancel dragging outside the document window
                if ( lens_offset.left > $(document).width() || 
                    lens_pos.top > $(document).height() ) {
                    dragging = false;
                    return false;
                }

                var offset_top = Math.max( e.clientY - click_offset, 0 );
                
                if ( offset_top < 0 )
                    return;

                lens.css( 'top', offset_top );
            });

            //resize_lens();

            $(document).bind( 'scroll', scroll_map );

            lens.bind( 'drag', function lens_drag_handler(e,ui) {
                dragging = true;
            });

            setInterval( function(){ lens_move_handler() }, 20 );
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
            //resize_lens();
        }
        
        // Scroll document if user moves lens
        lens_move_handler = function() {
            if ( dragging ) {
                dragging = false;
                var lens_pos = lens.position(),
                    pos = ( lens_pos.top + lens.height() ) * Math.floor( 
                            ( $(document).height() / $(window).height() ) );

                window.scrollTo( 0, pos );
                //$('html,body').animate( { scrollTop: pos }, 0 );
                //lens.animate( { top: 0 }, 10 );
            }
        },

        // Resize lens based on window height
        resize_lens = function(e){
            lens.height( $(window).height() * height_ratio );
        };

    map.append(  content );
    map.insertBefore( $(document.body).children().eq(0));

    lens_wrapper.append( lens );
    lens_wrapper.insertBefore( $(document.body).children().eq(0) );
    comment_tree( content, reddit_comments );

    height_ratio = $(window).height() / $(document).height();

    // Vroom!
    init_map();

});

