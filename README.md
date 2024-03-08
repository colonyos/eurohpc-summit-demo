# Instructions

## Preparations
### Upload dataset

```console
colonies fs sync -l /eurohpc-summit-demo/dataset -d dataset
```

### Upload source code
```console
colonies fs sync -l /eurohpc-summit-demo/models -d models
```


colonies fs sync -l /eurohpc-summit-demo/images -d images --keeplocal=true
colonies fs sync -l /eurohpc-summit-demo/pretrained-models -d pretrained-models --keeplocal=true
colonies fs sync -l /eurohpc-summit-demo/models/serving -d models/serving --keeplocal=true
