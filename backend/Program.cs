using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://localhost:5080");

builder.Services.AddDbContext<AppDb>(o => o.UseSqlite("Data Source=retail-demo.db"));
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDb>();
    db.Database.EnsureCreated();
    if (!db.Products.Any())
    {
        Product P(string n, string c, decimal pr) => new() { Name = n, Category = c, Price = pr };
        db.Products.AddRange(
            P("Trail Backpack", "Outdoors", 89), P("2-Person Tent", "Outdoors", 149), P("Hiking Boots", "Outdoors", 120),
            P("Wireless Earbuds", "Tech", 79), P("Smart Watch", "Tech", 199), P("Portable Charger", "Tech", 35),
            P("Desk Lamp", "Home", 42), P("Throw Blanket", "Home", 30), P("Ceramic Mug Set", "Home", 28));
        db.SaveChanges();
    }
}

app.UseCors();

app.MapGet("/api/products", async (AppDb db) => await db.Products.ToListAsync());

app.Run();