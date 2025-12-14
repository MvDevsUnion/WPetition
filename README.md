# WPetition 

a self hostable e petition system to collect signatures for your cause.   
this is made to be hosted by the person running the Petition and not as a full on petition platform.  
you will still have to export the signatures and submit it to the parliment   
for more info check out https://majlis.gov.mv/en/pes/petitions

## why make this
maldives parliment promised the release of a e-petition system powered by efass will be released months ago and then never released it   
i said fuck it i want data protection bill so i made this simple signature collection system since the law doesnt care if youre signature is signed digitally or via wet ink.   

## how to selfhost this (READ)
first you will need to edit the `sample.Petition.md` file to fit your petition needs  
then boot up the api server and upload the file

```
curl -X 'POST' \
  'http://localhost:5299/api/Debug/upload-petition' \
  -H 'accept: */*' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@my_WPetition.md'
```

this will create the petition in the DB and will also return a guid you can use

```
{
  "message": "Petition created successfully",
  "petitionId": "13921eaa-aea4-4d74-a0f5-52a81c5e7355",
}
```

now go back to appsettings.json and set this to false

```
  "PetitionSettings": {
    "AllowPetitionCreation": false
  },
```

next you will need to host your frontend but before you do that go to line 80 on index.html and edit this line to point to your api server

```
baseUrl: 'http://localhost:5299' 
```

now you are ready to roll

go to www.yourdomain.com/index.html?id=[your petition id] and it should all be set

## nerd shit

for more info check the readme inside the api folder

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Verify MongoDB is running
- Check connection string in `appsettings.json`
- Ensure network connectivity to MongoDB instance

## Contributing

When contributing to this project:
1. Follow existing code style and conventions
2. Test all endpoints thoroughly
3. Update documentation for any API changes
4. Ensure rate limiting is not disabled in production

## License

if you use this you must mention that its powered by Mv Devs Union 

also any forks must be open source 

this must never be used for data collection and profiling people 

## Support

For issues or questions, please open an issue on the repository.
