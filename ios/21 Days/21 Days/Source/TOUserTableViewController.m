#import "TOUserTableViewController.h"

// Facebook App ID
static NSString* kAppId = @"101103209968654";

@implementation TOUserTableViewController

@synthesize facebook=_facebook;

- (id)initWithStyle:(UITableViewStyle)style
{
    self = [super initWithStyle:style];
    if (self) 
    {
        _permissions = [[NSArray arrayWithObjects: @"read_stream", @"offline_access",nil] retain];
        _isConnectedToFacebook = NO;
    }
    return self;
}

- (void)dealloc
{
    [super dealloc];
    [_facebook release];
    [_permissions release];
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

    // Uncomment the following line to preserve selection between presentations.
    // self.clearsSelectionOnViewWillAppear = NO;
 
    // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
    // self.navigationItem.rightBarButtonItem = self.editButtonItem;

    _facebook = [[Facebook alloc] initWithAppId:kAppId];
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
}

- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
}

- (void)viewDidDisappear:(BOOL)animated
{
    [super viewDidDisappear:animated];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
    return (interfaceOrientation == UIInterfaceOrientationPortrait);
}

#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    // Return the number of sections.
    return 2;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    // Return the number of rows in the section.
    if (section == 0)
    {
        return 1;
    }
    else if (section == 1)
    {
        return 1;
    }
    return 0;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *CellIdentifier = @"Cell";
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (cell == nil) {
        cell = [[[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:CellIdentifier] autorelease];
    }
    
    // Configure the cell...
    MyLog(@"%@",  NSStringFromSelector(_cmd));

    NSInteger section = [indexPath indexAtPosition:0];
    if (section == 0)
        [self BuildUserCell:cell];
    else if (section == 1)
        [self BuildConnectionCell:cell];
    
    return cell;
}

- (NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section
{
    if (section == 0)
    {
        return @"User";
    }
    else if (section == 1)
    {
        return @"Connection";
    }
    return @"";
}

/*
// Override to support conditional editing of the table view.
- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath
{
    // Return NO if you do not want the specified item to be editable.
    return YES;
}
*/

/*
// Override to support editing the table view.
- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (editingStyle == UITableViewCellEditingStyleDelete) {
        // Delete the row from the data source
        [tableView deleteRowsAtIndexPaths:[NSArray arrayWithObject:indexPath] withRowAnimation:UITableViewRowAnimationFade];
    }   
    else if (editingStyle == UITableViewCellEditingStyleInsert) {
        // Create a new instance of the appropriate class, insert it into the array, and add a new row to the table view
    }   
}
*/

/*
// Override to support rearranging the table view.
- (void)tableView:(UITableView *)tableView moveRowAtIndexPath:(NSIndexPath *)fromIndexPath toIndexPath:(NSIndexPath *)toIndexPath
{
}
*/

/*
// Override to support conditional rearranging of the table view.
- (BOOL)tableView:(UITableView *)tableView canMoveRowAtIndexPath:(NSIndexPath *)indexPath
{
    // Return NO if you do not want the item to be re-orderable.
    return YES;
}
*/

- (UITableViewCell*) GetUserCell
{
    return [self.tableView cellForRowAtIndexPath:[NSIndexPath indexPathForRow:0 inSection:0]];
}

// Returns Connection cell.
- (UITableViewCell*) GetConnectionCell
{
    return [self.tableView cellForRowAtIndexPath:[NSIndexPath indexPathForRow:0 inSection:1]];
}


#pragma mark - Table view delegate

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    // Navigation logic may go here. Create and push another view controller.
    if ([indexPath compare:[NSIndexPath indexPathForRow:0 inSection:1]] == NSOrderedSame)
    {
        if (![self IsConnectedToFacebook])
            [self.facebook authorize:_permissions delegate:self];
        else
            [self.facebook logout:self];
        
        UITableViewCell* cell = [self GetConnectionCell];
        cell.selected = NO;
    }
}

#pragma mark Facebook Delegate

- (void)fbDidLogin 
{
    MyLog(@"Facebook: Used did log in.");
    _isConnectedToFacebook = YES;
    
    // Build user Cell
    UITableViewCell* cell = [self GetUserCell];
    [self BuildUserCell:cell];
    
    // Build connect Cell
    cell = [self GetConnectionCell];
    [self BuildConnectionCell:cell];
    
}

- (void)fbDidNotLogin:(BOOL)cancelled
{
    MyLog(@"Facebook: Used did NOT log in.");
}

- (void)fbDidLogout
{
    MyLog(@"Facebook: Used did log out.");
    _isConnectedToFacebook = NO;

    // Build user Cell
    UITableViewCell* cell = [self GetUserCell];
    [self BuildUserCell:cell];
    
    // Build connect Cell
    cell = [self GetConnectionCell];
    [self BuildConnectionCell:cell];    
}

- (BOOL) IsConnectedToFacebook
{
    return _isConnectedToFacebook;
}

- (void) BuildConnectionCell:(UITableViewCell*) cell
{
    if ([self IsConnectedToFacebook])
        cell.textLabel.text = @"Logout";
    else
        cell.textLabel.text = @"Login with Facebook Connect";
        
    UIImage* image = [UIImage imageNamed:@"FBDialog.bundle/images/fbicon.png"];
    [cell.imageView setImage:image];
}

- (void) BuildUserCell:(UITableViewCell*) cell
{   
    if ([self IsConnectedToFacebook])
        [_facebook requestWithGraphPath:@"me" andDelegate:self];
    else {
        cell.textLabel.text = @"Please log in";
    }
}

- (void)request:(FBRequest *)request didFailWithError:(NSError *)error
{
    MyLog(@"Facebook: didFailWithError: %@", error);
}

- (void)request:(FBRequest *)request didLoad:(id)result
{
    MyLog(@"Facebook: didLoad");
    // TODO: check what was requested I am assuming dictionary
    if (![result isKindOfClass:[NSDictionary class]])
        return;
    
    NSDictionary* dict = (NSDictionary*) result;
    MyLog(@"Dict: %@", dict);

    NSString* fullName = [dict objectForKey:@"name"];
    MyLog(@"Full Facebook Name: %@", fullName);
    
    UITableViewCell* cell = [self GetUserCell];
    cell.textLabel.text = fullName;
}

@end

