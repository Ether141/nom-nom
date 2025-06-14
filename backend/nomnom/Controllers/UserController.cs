using BlinkDatabase.General;
using BlinkHttp.Authentication;
using BlinkHttp.Authentication.Session;
using BlinkHttp.Http;
using BlinkHttp.Logging;
using BlinkHttp.Validation;
using nomnom.DataTransferObjects;
using nomnom.Mapping;
using nomnom.Models;
using nomnom.Validation;

namespace nomnom.Controllers;

[Route("user")]
internal class UserController : Controller
{
    private readonly IRepository<User> userRepository;
    private readonly IRepository<UserRole> userRoleRepository;
    private readonly ILogger logger;
    private readonly AuthenticationProvider authenticationProvider;
    private readonly SessionManager authorizer;

    public UserController(IRepository<User> userRepository, IRepository<UserRole> userRoleRpository, IAuthorizer authorizer, IUserInfoProvider userInfoProvider, ILogger logger)
    {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRpository;
        this.authorizer = (SessionManager)authorizer;
        authenticationProvider = new AuthenticationProvider(userInfoProvider);
        this.logger = logger;
    }

    [HttpPost("create")]
    public IHttpResult CreateUser([FromBody] CreateUserDTO dto)
    {
        logger.Debug("Received request - create new user.");

        ModelValidator validator = new ModelValidator();
        ValidationResult validationResult = validator.Validate(dto);

        if (!validationResult.IsValid)
        {
            logger.Info($"User creation failed for email: {dto.Email}. Validation errors: {string.Join(", ", validationResult.Errors)}");
            return JsonResult.FromObject(new { validationResult.Errors }, System.Net.HttpStatusCode.BadRequest);
        }

        if (userRepository.Exists(u => u.Email == dto.Email))
        {
            logger.Info($"User creation failed for email: {dto.Email}. User with given email address already exists.");
            return JsonResult.FromObject(new { Errors = "User with given email address already exists." }, System.Net.HttpStatusCode.BadRequest);
        }

        string hashedPassword = PasswordHasher.HashPassword(dto.Password);
        dto.Password = hashedPassword;

        User user = new UserMapper().Map(dto);
        UserRole userRole = userRoleRepository.SelectSingle(r => r.Role == UserRole.UserRoleName)!;

        user.Role = userRole;
        userRepository.Insert(user);

        logger.Info($"User created successfully. ID: {user.Id}, Email: {user.Email}");

        return JsonResult.FromObject(user, System.Net.HttpStatusCode.Created);
    }

    [HttpPost("login")]
    public IHttpResult Login([FromBody] string email, [FromBody] string password)
    {
        logger.Debug($"Login attempt for email: {email}");
        CredentialsValidationResult validationResult = authenticationProvider.ValidateCredentials(email, password, out IUser? user);
        logger.Debug($"Finished credentials validation with result: {validationResult}");

        SessionInfo? sessionInfo = null;

        if (validationResult == CredentialsValidationResult.Success)
        {
            sessionInfo = authorizer.CreateSession(user!.Id, Response);
            logger.Info($"User login successful. UserId: {user.Id}, Email: {email}");
        }
        else
        {
            logger.Warning($"User login failed for email: {email}. Reason: {validationResult}");
        }

        return validationResult == CredentialsValidationResult.Success ? JsonResult.FromObject(sessionInfo) : Unauthorized();
    }

    [Authorize]
    [HttpPost("logout")]
    [Cors(Credentials = true)]
    public IHttpResult Logout()
    {
        logger.Debug($"Logout attempt for user: {User?.Id}");
        authorizer.InvalidSession(Request!);
        logger.Info($"User logged out. UserId: {User?.Id}");
        return Ok();
    }

    [Authorize]
    [HttpPost("get")]
    [Cors(Credentials = true)]
    public IHttpResult Get()
    {
        logger.Debug($"Fetching user info for user: {User?.Id}");
        User user = userRepository.SelectSingle(u => u.Id == int.Parse(User!.Id))!;
        return JsonResult.FromObject(new { user.Id, user.Name, user.Balance, user.Role.Role });
    }

    [Authorize]
    [HttpPost("change-password")]
    public IHttpResult ChangePassword([FromBody] string currentPassword, [FromBody] string newPassword)
    {
        logger.Debug($"Password change attempt for user: {User?.Id}");

        string? validationError = new PasswordAttribute().ValidateAndGetErrorMessage(newPassword);

        if (validationError != null)
        {
            logger.Warning($"Password change failed for user: {User?.Id}. Reason: {validationError}");
            return BadRequest();
        }

        User user = userRepository.SelectSingle(u => u.Id == int.Parse(User!.Id))!;

        if (!PasswordHasher.VerifyPassword(currentPassword, user.Password))
        {
            logger.Warning($"Password change failed for user: {User?.Id}. Reason: Current password incorrect.");
            return BadRequest();
        }

        user.Password = PasswordHasher.HashPassword(newPassword);
        userRepository.Update(user);

        logger.Info($"Password changed successfully for user: {user.Id}");
        return Ok();
    }

    [Authorize]
    [HttpPost("add-funds")]
    public IHttpResult AddFunds([FromBody] decimal amount)
    {
        logger.Debug($"Add funds attempt for user: {User?.Id}, Amount: {amount}");

        if (amount < 10 || amount > 500)
        {
            logger.Warning($"Add funds failed for user: {User?.Id}. Invalid amount: {amount}");
            return BadRequest();
        }

        User user = userRepository.SelectSingle(u => u.Id == int.Parse(User!.Id))!;
        user.Balance += amount;
        userRepository.Update(user);

        logger.Info($"Funds added successfully for user: {user.Id}. New balance: {user.Balance}");
        return JsonResult.FromObject(new { user.Balance });
    }
}
