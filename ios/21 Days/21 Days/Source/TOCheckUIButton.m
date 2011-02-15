//
//  21 Days
//
//  Created by Zdenek on 2/13/11.

#import "TOCheckUIButton.h"

@implementation TOCheckUIButton

@synthesize selected = _selected;

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        // Initialization code
        self.selected = NO;
        
		UIImage* backgroundImage = [UIImage imageNamed: @"button_placeholder.png"];
		UIImage* emptyImage = [UIImage imageNamed: @"button_empty.png"];
		//UIImage* selectedImage = [UIImage imageNamed: @"button_selected.png"];
		
		// Set up button
		[self setBackgroundImage: backgroundImage forState: UIControlStateNormal];
        [self setImage: emptyImage forState: UIControlStateNormal];
        
		[self addTarget: self action: @selector(buttonClicked:) forControlEvents: UIControlEventTouchUpInside];        
    }
    return self;
}

- (void)buttonClicked:(id)sender
{
	self.selected = !self.selected;

    if (self.selected)
    {
		UIImage* image = [UIImage imageNamed: @"button_selected.png"];
        [self setImage: image forState: UIControlStateNormal];        
    }
    else
    {
		UIImage* image = [UIImage imageNamed: @"button_empty.png"];
        [self setImage: image forState: UIControlStateNormal];        
    }
}

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect
{
    // Drawing code
}
*/

- (void)dealloc
{
    [super dealloc];
}

@end
