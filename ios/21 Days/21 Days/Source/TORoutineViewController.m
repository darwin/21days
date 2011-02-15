//
//  21 Days
//
//  Created by Zdenek on 2/13/11.

#import "TORoutineViewController.h"
#import "TOCheckUIButton.h"

@implementation TORoutineViewController

@synthesize routineName = _routineName;
@synthesize mondayButton = _mondayButton;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
        
        // Init buttons
        NSMutableArray* buttons = [[NSMutableArray alloc] initWithCapacity:7];
        
        CGRect buttonFrame = CGRectMake(2, 25, 44, 44);
        for (int i = 0; i < 7; ++i)
        {
            TOCheckUIButton* checkButton = [[TOCheckUIButton alloc] initWithFrame:buttonFrame];
            [buttons addObject:checkButton];
            
            buttonFrame.origin.x += 45;
            
            [self.view addSubview:checkButton];
        }
    }
    return self;
}

- (void)dealloc
{
    [super dealloc];
}

- (void)didReceiveMemoryWarning
{
    // Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];
    
    // Release any cached data, images, etc that aren't in use.
}

#pragma mark - View lifecycle

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
     
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
    return (interfaceOrientation == UIInterfaceOrientationPortrait);
}

#pragma mark -
- (void) setRoutine:(NSString*) name
{
    MyLog(@"Setting routine name: %@", name);
    self.routineName.text = name;
}


@end
